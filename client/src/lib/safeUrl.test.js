import test from 'node:test'
import assert from 'node:assert/strict'
import { getSafeUrl } from './safeUrl.js'

test('getSafeUrl keeps web links and rejects script URLs', () => {
  assert.equal(getSafeUrl('https://github.com/you'), 'https://github.com/you')
  assert.equal(getSafeUrl('github.com/you'), 'https://github.com/you')
  assert.equal(getSafeUrl('javascript:alert(1)'), null)
  assert.equal(getSafeUrl('data:text/html,x'), null)
  assert.equal(getSafeUrl(''), null)
})
