// npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nextEvent, untilLabel } from './nextEvent.js'

const now = new Date('2026-11-11T15:00:00')
const ev = (title, date, isSpotlight = false) => ({ title, date, time: '10:00 AM IST', isSpotlight })

test('nextEvent picks upcoming spotlight, else soonest, skips past', () => {
  const past = ev('past', '2026-11-01', true)
  const later = ev('later', '2026-12-20')
  const soon = ev('soon', '2026-11-20')
  assert.equal(nextEvent([past, later, soon], now).title, 'soon')
  assert.equal(nextEvent([past, later, soon, ev('spot', '2026-12-30', true)], now).title, 'spot')
  assert.equal(nextEvent([ev('today', '2026-11-11')], now).title, 'today')
  assert.equal(nextEvent([past], now), null)
  assert.equal(nextEvent([], now), null)
})

test('untilLabel', () => {
  assert.equal(untilLabel(new Date('2026-11-11T18:00:00'), now), 'today')
  assert.equal(untilLabel(new Date('2026-11-12T09:00:00'), now), 'tomorrow')
  assert.equal(untilLabel(new Date('2026-11-29T12:30:00'), now), 'in 18 days')
})
