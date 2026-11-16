// ==============================================================================
// Unit Tests: analyticsFormat.js (Phase 2 Gate: T2.1 - T2.4)
// Uses Node's built-in test runner (node:test)
// ==============================================================================

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  rangeToDates,
  previousRange,
  pctDelta,
  formatCompact,
  linePath,
  rateVital,
  toCsv,
  funnelRows,
} from './analyticsFormat.js'

describe('Phase 2: Analytics Format Unit Tests', () => {
  test('T2.1: rangeToDates and previousRange', () => {
    const fixedNow = '2026-11-16T12:00:00.000Z'
    const current = rangeToDates(30, fixedNow)

    assert.equal(current.to, fixedNow)
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
    assert.equal(
      new Date(current.from).getTime(),
      new Date(fixedNow).getTime() - thirtyDaysMs
    )

    const prev = previousRange(current)
    // No gap, no overlap: prev.to must equal current.from
    assert.equal(prev.to, current.from)
    assert.equal(
      new Date(prev.from).getTime(),
      new Date(current.from).getTime() - thirtyDaysMs
    )
  })

  test('T2.2: pctDelta', () => {
    assert.equal(pctDelta(120, 100), 20)
    assert.equal(pctDelta(80, 100), -20)
    assert.equal(pctDelta(100, 100), 0)
    assert.equal(pctDelta(0, 0), null)
    assert.equal(pctDelta(5, 0), null)
    assert.equal(pctDelta(null, 100), null)
    assert.equal(pctDelta(100, null), null)
  })

  test('T2.3: formatCompact', () => {
    assert.equal(formatCompact(999), '999')
    assert.equal(formatCompact(1000), '1k')
    assert.equal(formatCompact(1234), '1.2k')
    assert.equal(formatCompact(15600), '15.6k')
    assert.equal(formatCompact(1200000), '1.2M')
  })

  test('T2.4: linePath geometry', () => {
    const width = 400
    const height = 200
    const pad = 10

    // Empty array returns empty path without throwing
    const emptyResult = linePath([], width, height, pad)
    assert.equal(emptyResult.path, '')
    assert.deepEqual(emptyResult.points, [])

    // Single zero value maps to bottom pad
    const zeroResult = linePath([0], width, height, pad)
    assert.equal(zeroResult.points.length, 1)
    assert.equal(zeroResult.points[0].y, height - pad)

    // Single positive value maps to top pad
    const singleResult = linePath([100], width, height, pad)
    assert.equal(singleResult.points.length, 1)
    assert.equal(singleResult.points[0].y, pad)

    // Multi-point values: max value maps to top pad, zero maps to bottom pad, points within box
    const multiResult = linePath([0, 50, 100], width, height, pad)
    assert.equal(multiResult.points.length, 3)
    assert.equal(multiResult.points[0].y, height - pad) // 0 maps to bottom
    assert.equal(multiResult.points[2].y, pad) // 100 (max) maps to top
    assert.ok(multiResult.path.startsWith('M '))

    for (const pt of multiResult.points) {
      assert.ok(pt.x >= pad && pt.x <= width - pad)
      assert.ok(pt.y >= pad && pt.y <= height - pad)
    }
  })

  test('T5.1: toCsv formatting & formula injection mitigation', () => {
    const columns = [
      { key: 'name', label: 'Candidate Name' },
      { key: 'note', label: 'Remarks' },
      { key: 'calc', label: 'Formula' },
    ]

    // Empty rows produces header only
    const headerOnly = toCsv([], columns)
    assert.equal(headerOnly, 'Candidate Name,Remarks,Formula')

    const rows = [
      {
        name: 'Sharma, Aarav', // contains comma
        note: 'Said "Ready to build"\non DGX', // contains quotes and newline
        calc: '=1+2', // starts with '='
      },
      {
        name: '+PlusOne',
        note: '-MinusOne',
        calc: '@Sum',
      },
    ]

    const csv = toCsv(rows, columns)

    // Header matches
    assert.ok(csv.startsWith('Candidate Name,Remarks,Formula'))

    // Escaped quotes, commas, and newlines
    assert.ok(csv.includes('"Sharma, Aarav"'))
    assert.ok(csv.includes('"Said ""Ready to build""\non DGX"'))

    // Formula injection prefix with single quote
    assert.ok(csv.includes("'=1+2"))
    assert.ok(csv.includes("'+PlusOne"))
    assert.ok(csv.includes("'-MinusOne"))
    assert.ok(csv.includes("'@Sum"))
  })

  test('T5.3: rateVital threshold classifications', () => {
    // Boundary values (2.5s, 200ms, 0.1) classify as 'good'
    assert.equal(rateVital('LCP', 2.5), 'good')
    assert.equal(rateVital('LCP', 2500), 'good')
    assert.equal(rateVital('LCP', 3200), 'needs-improvement')
    assert.equal(rateVital('LCP', 4500), 'poor')

    assert.equal(rateVital('INP', 200), 'good')
    assert.equal(rateVital('INP', 250), 'needs-improvement')
    assert.equal(rateVital('INP', 600), 'poor')

    assert.equal(rateVital('CLS', 0.1), 'good')
    assert.equal(rateVital('CLS', 0.15), 'needs-improvement')
    assert.equal(rateVital('CLS', 0.35), 'poor')
  })
})

describe('Funnel CSV rows', () => {
  test('funnelRows converts the RPC steps object into ordered rows', () => {
    const rows = funnelRows({ view: 4, start: 3, projects: 2, submit: 1 })
    assert.equal(rows.length, 4)
    assert.deepEqual(rows[0], { step: 'Visited /join', count: 4, conversion: 100 })
    assert.equal(rows[1].conversion, 75)
    assert.equal(rows[3].count, 1)
    assert.equal(rows[3].conversion, 50)
  })

  test('funnelRows tolerates missing or empty steps without throwing', () => {
    assert.equal(funnelRows().length, 4)
    assert.equal(funnelRows(null).length, 4)
    assert.equal(funnelRows({})[2].conversion, 0)
    assert.ok(Array.isArray(funnelRows({ view: 'x' })))
  })
})
