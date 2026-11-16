// ==============================================================================
// CLUSTER Society — Pure Analytics Formatters & Chart Geometry Helpers
// Pure JavaScript. No DOM or Supabase dependencies. 100% unit-testable.
// ==============================================================================

/**
 * Computes ISO date strings for a trailing window of N days ending at `now`.
 * @param {number} days
 * @param {Date|string|number} [now]
 * @returns {{ from: string, to: string }}
 */
export function rangeToDates(days, now = new Date()) {
  const toDate = new Date(now)
  const fromDate = new Date(toDate.getTime() - Number(days) * 24 * 60 * 60 * 1000)

  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  }
}

/**
 * Computes previous range of identical duration immediately preceding the given range.
 * @param {{ from: string, to: string }} range
 * @returns {{ from: string, to: string }}
 */
export function previousRange({ from, to }) {
  const fromTs = new Date(from).getTime()
  const toTs = new Date(to).getTime()
  const duration = toTs - fromTs

  const prevTo = new Date(fromTs).toISOString()
  const prevFrom = new Date(fromTs - duration).toISOString()

  return {
    from: prevFrom,
    to: prevTo,
  }
}

/**
 * Calculates percentage delta between current and previous values.
 * Returns null if previous is 0 or invalid.
 * @param {number} current
 * @param {number} previous
 * @returns {number|null}
 */
export function pctDelta(current, previous) {
  if (
    previous == null ||
    current == null ||
    isNaN(current) ||
    isNaN(previous) ||
    Number(previous) === 0
  ) {
    return null
  }

  const curr = Number(current)
  const prev = Number(previous)
  return Math.round(((curr - prev) / prev) * 100)
}

/**
 * Formats numbers compactly (e.g. 1234 -> "1.2k", 1200000 -> "1.2M").
 * @param {number} n
 * @returns {string}
 */
export function formatCompact(n) {
  if (n == null || isNaN(n)) return '0'
  const val = Number(n)

  if (Math.abs(val) < 1000) {
    return String(val)
  }

  if (Math.abs(val) < 1000000) {
    const k = val / 1000
    const formatted = parseFloat(k.toFixed(1))
    return `${formatted}k`
  }

  const m = val / 1000000
  const formatted = parseFloat(m.toFixed(1))
  return `${formatted}M`
}

/**
 * Formats numbers as a percentage string.
 * @param {number} n
 * @returns {string}
 */
export function formatPct(n) {
  if (n == null || isNaN(n)) return '0%'
  return `${Number(n)}%`
}

/**
 * Computes SVG line path string, area fill path, and coordinate points for SVG charting.
 * @param {number[]} values
 * @param {number} width
 * @param {number} height
 * @param {number} [pad=10]
 * @returns {{ path: string, areaPath: string, points: Array<{ x: number, y: number, value: number }> }}
 */
export function linePath(values, width, height, pad = 10) {
  if (!values || values.length === 0) {
    return { path: '', areaPath: '', points: [] }
  }

  if (values.length === 1) {
    const val = Number(values[0]) || 0
    const x = width / 2
    // Max value maps to top padding; zero to bottom padding
    const y = val === 0 ? height - pad : pad
    const pt = { x, y, value: val }
    return {
      path: `M ${x.toFixed(1)},${y.toFixed(1)}`,
      areaPath: `M ${x.toFixed(1)},${y.toFixed(1)}`,
      points: [pt],
    }
  }

  const nums = values.map((v) => Number(v) || 0)
  const min = 0
  const max = Math.max(1, ...nums)
  const W = width - 2 * pad
  const H = height - 2 * pad

  const points = nums.map((val, i) => {
    const x = pad + (i / (nums.length - 1)) * W
    const y = pad + H - ((val - min) / (max - min)) * H
    return {
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      value: val,
    }
  })

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
    .join(' ')

  const bottomY = (height - pad).toFixed(1)
  const areaPath = `${path} L ${points[points.length - 1].x},${bottomY} L ${points[0].x},${bottomY} Z`

  return { path, areaPath, points }
}

/**
 * Rates Web Vitals based on official Core Web Vitals thresholds.
 * @param {'LCP'|'INP'|'CLS'} metric
 * @param {number} value
 * @returns {'good'|'needs-improvement'|'poor'}
 */
export function rateVital(metric, value) {
  if (value == null || isNaN(value)) return 'good'
  const val = Number(value)
  const m = (metric || '').toUpperCase()

  if (m === 'LCP') {
    // Thresholds: good <= 2.5s (2500ms), needs improvement <= 4.0s (4000ms)
    // Support both seconds (< 10) and milliseconds
    const ms = val <= 10 ? val * 1000 : val
    if (ms <= 2500) return 'good'
    if (ms <= 4000) return 'needs-improvement'
    return 'poor'
  }

  if (m === 'INP') {
    // Thresholds: good <= 200ms, needs improvement <= 500ms
    if (val <= 200) return 'good'
    if (val <= 500) return 'needs-improvement'
    return 'poor'
  }

  if (m === 'CLS') {
    // Thresholds: good <= 0.1, needs improvement <= 0.25
    if (val <= 0.1) return 'good'
    if (val <= 0.25) return 'needs-improvement'
    return 'poor'
  }

  return 'good'
}

/**
 * Serializes rows into CSV format with formula injection sanitization and RFC 4180 escaping.
 * @param {Array<Object>} rows
 * @param {Array<{ key: string, label: string }|string>} columns
 * @returns {string}
 */
export function toCsv(rows = [], columns = []) {
  if (!columns || columns.length === 0) return ''

  const cols = columns.map((col) =>
    typeof col === 'string' ? { key: col, label: col } : col
  )

  const sanitizeCell = (rawVal) => {
    if (rawVal == null) return ''
    let str = String(rawVal)

    // Formula injection mitigation (cells starting with =, +, -, @)
    if (/^[=+\-@]/.test(str)) {
      str = "'" + str
    }

    // Escape if contains comma, quote, or newline
    if (/[",\n\r]/.test(str)) {
      str = `"${str.replace(/"/g, '""')}"`
    }

    return str
  }

  const headerLine = cols.map((c) => sanitizeCell(c.label)).join(',')

  if (!rows || rows.length === 0) {
    return headerLine
  }

  const bodyLines = rows.map((row) =>
    cols.map((c) => sanitizeCell(row[c.key])).join(',')
  )

  return [headerLine, ...bodyLines].join('\n')
}
