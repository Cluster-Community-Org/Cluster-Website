// npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { eventStart } from './eventStart.js'

const hm = (d) => [d.getHours(), d.getMinutes()]

test('eventStart parses 12h, 24h and missing times', () => {
  assert.deepEqual(hm(eventStart({ date: '2026-12-05', time: '05:00 PM IST' })), [17, 0])
  assert.deepEqual(hm(eventStart({ date: '2026-12-05', time: '12:30 am' })), [0, 30])
  assert.deepEqual(hm(eventStart({ date: '2026-12-05', time: '12:15 PM' })), [12, 15])
  assert.deepEqual(hm(eventStart({ date: '2026-12-05', time: '17:45' })), [17, 45])
  assert.deepEqual(hm(eventStart({ date: '2026-12-05' })), [9, 0])
  assert.equal(eventStart({ date: '2026-12-05', time: '9:05 AM' }).getDate(), 5)
})
