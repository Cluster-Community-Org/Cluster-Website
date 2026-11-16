import { useState, useRef, useMemo } from 'react'
import { linePath, formatCompact } from '../../../lib/analyticsFormat.js'

export function LineChart({
  data = [],
  annotations = [],
  metricKey = 'visitors',
  secondaryKey = 'pageviews',
  labelKey = 'day',
  height = 240,
  loading = false,
  title = 'Daily Traffic',
}) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const containerRef = useRef(null)

  const width = 800
  const pad = 24

  const values = useMemo(() => {
    return data.map((d) => Number(d[metricKey]) || 0)
  }, [data, metricKey])

  const secondaryValues = useMemo(() => {
    return data.map((d) => Number(d[secondaryKey]) || 0)
  }, [data, secondaryKey])

  const maxVal = useMemo(() => {
    const combined = [...values, ...secondaryValues]
    return combined.length > 0 ? Math.max(1, ...combined) : 1
  }, [values, secondaryValues])

  const { path: primaryPath, areaPath: primaryArea, points: primaryPoints } = useMemo(() => {
    return linePath(values, width, height, pad)
  }, [values, height])

  const { path: secPath } = useMemo(() => {
    return linePath(secondaryValues, width, height, pad)
  }, [secondaryValues, height])

  const markers = useMemo(() => {
    if (!annotations || annotations.length === 0 || !primaryPoints || primaryPoints.length === 0) {
      return []
    }

    const res = []
    annotations.forEach((anno) => {
      const targetDay = (anno.day || anno.date || anno.created_at || '').slice(0, 10)
      if (!targetDay) return
      const idx = data.findIndex((d) => d[labelKey] === targetDay)
      if (idx !== -1 && primaryPoints[idx]) {
        res.push({
          x: primaryPoints[idx].x,
          day: targetDay,
          action: anno.action || 'Audit Event',
          summary: anno.summary || anno.label || anno.action,
        })
      }
    })
    return res
  }, [annotations, data, labelKey, primaryPoints])

  const handleMouseMove = (e) => {
    if (!containerRef.current || data.length === 0) return
    const rect = containerRef.current.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, (relX - (pad / width) * rect.width) / (rect.width * (1 - (2 * pad) / width))))
    const idx = Math.round(percent * (data.length - 1))
    if (idx >= 0 && idx < data.length) {
      setHoverIndex(idx)
    }
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-6" />
        <div className="h-[220px] bg-white/5 rounded-xl" />
      </div>
    )
  }

  const isEmpty = !data || data.length === 0 || values.every((v) => v === 0)

  return (
    <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-mono font-semibold text-white tracking-wide">{title}</h3>
          <p className="text-xs font-mono text-[#8E8E88] mt-0.5">
            Unique visitors & pageviews over the selected period
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cluster-acid" />
            <span className="text-[#8E8E88]">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
            <span className="text-[#8E8E88]">Pageviews</span>
          </div>
          {markers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 font-medium">
                {markers.length} Marker{markers.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.06] rounded-xl">
          <p className="text-sm font-mono text-[#8E8E88]">No traffic recorded in this range</p>
          <span className="text-xs font-mono text-[#8E8E88]/60 mt-1">
            Data refreshes automatically as visitors arrive
          </span>
        </div>
      ) : (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative cursor-crosshair select-none"
        >
          {/* Active Hover Tooltip */}
          {hoverIndex !== null && data[hoverIndex] && (
            <div
              className="absolute z-20 pointer-events-none -translate-x-1/2 -top-2 bg-[#17181C] border border-white/20 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md"
              style={{
                left: `${(primaryPoints[hoverIndex]?.x / width) * 100}%`,
              }}
            >
              <div className="text-[11px] font-mono text-[#8E8E88] mb-1">
                {data[hoverIndex][labelKey]}
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cluster-acid font-bold">
                  {data[hoverIndex][metricKey] || 0} visitors
                </span>
                <span className="text-white/70">
                  {data[hoverIndex][secondaryKey] || 0} views
                </span>
              </div>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="visitorsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E599" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00E599" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = pad + (height - 2 * pad) * pct
              return (
                <line
                  key={idx}
                  x1={pad}
                  y1={y}
                  x2={width - pad}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
              )
            })}

            {/* Area Fill for primary */}
            {primaryArea && (
              <path d={primaryArea} fill="url(#visitorsAreaGrad)" />
            )}

            {/* Secondary line (Pageviews) */}
            {secPath && (
              <path
                d={secPath}
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* Primary line (Visitors) */}
            {primaryPath && (
              <path
                d={primaryPath}
                fill="none"
                stroke="#00E599"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Audit Log Annotation Vertical Markers */}
            {markers.map((m, idx) => (
              <g key={`anno-${idx}`} className="cursor-pointer">
                <title>{`${m.day} — ${m.action}: ${m.summary}`}</title>
                <line
                  x1={m.x}
                  y1={pad}
                  x2={m.x}
                  y2={height - pad}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.85"
                />
                <circle
                  cx={m.x}
                  cy={pad + 6}
                  r="4"
                  fill="#F59E0B"
                  stroke="#0F1012"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            {/* Hover Indicator Line & Dot */}
            {hoverIndex !== null && primaryPoints[hoverIndex] && (
              <g>
                <line
                  x1={primaryPoints[hoverIndex].x}
                  y1={pad}
                  x2={primaryPoints[hoverIndex].x}
                  y2={height - pad}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={primaryPoints[hoverIndex].x}
                  cy={primaryPoints[hoverIndex].y}
                  r="5"
                  fill="#00E599"
                  stroke="#0F1012"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Bottom X-Axis Date Labels */}
          <div className="flex justify-between text-[11px] font-mono text-[#8E8E88] mt-3 px-2">
            <span>{data[0]?.[labelKey] || ''}</span>
            {data.length > 2 && (
              <span>{data[Math.floor(data.length / 2)]?.[labelKey] || ''}</span>
            )}
            <span>{data[data.length - 1]?.[labelKey] || ''}</span>
          </div>
        </div>
      )}
    </div>
  )
}
