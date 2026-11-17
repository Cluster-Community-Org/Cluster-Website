// ==============================================================================
// Unit Tests: analyticsTrack.js (Phase 3 Gate: T3.1 - T3.3)
// Uses Node's built-in test runner (node:test)
// ==============================================================================

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  findTrackTarget,
  isOutbound,
  createOnce,
} from './analyticsTrack.js'

// Mock node factory for testing without JSDOM
function createMockNode(attrs = {}, parent = null) {
  return {
    getAttribute: (name) => attrs[name] || null,
    parentElement: parent,
  }
}

describe('Phase 3: Analytics Track Unit Tests', () => {
  test('T3.1: findTrackTarget hierarchy traversal', () => {
    // 1. Direct match on the node itself
    const directNode = createMockNode({
      'data-track': 'registration',
      'data-track-slug': 'kickstart',
    })
    const directRes = findTrackTarget(directNode)
    assert.deepEqual(directRes, {
      name: 'registration',
      target: 'registration',
      slug: 'kickstart',
    })

    // 2. Parent 3 levels up
    const greatGrandParent = createMockNode({
      'data-track': 'banner_cta',
      'data-track-target': 'banner_primary',
    })
    const grandParent = createMockNode({}, greatGrandParent)
    const parent = createMockNode({}, grandParent)
    const child = createMockNode({}, parent)

    const parentRes = findTrackTarget(child)
    assert.deepEqual(parentRes, {
      name: 'banner_cta',
      target: 'banner_primary',
      slug: undefined,
    })

    // 3. Past 6 levels returns null
    let deepNode = createMockNode({ 'data-track': 'too_deep' })
    for (let i = 0; i < 7; i++) {
      deepNode = createMockNode({}, deepNode)
    }
    assert.equal(findTrackTarget(deepNode), null)

    // 4. Absent returns null
    const noTrackNode = createMockNode({})
    assert.equal(findTrackTarget(noTrackNode), null)
    assert.equal(findTrackTarget(null), null)
  })

  test('T3.2: isOutbound link detection', () => {
    const site = 'cluster.org'

    assert.equal(isOutbound('https://github.com/x', site), true)
    assert.equal(isOutbound('http://instagram.com/cluster', site), true)
    assert.equal(isOutbound('https://cluster.org/events', site), false)
    assert.equal(isOutbound('https://www.cluster.org', site), false)

    // Non-web protocol links and relative paths
    assert.equal(isOutbound('mailto:a@b.c', site), false)
    assert.equal(isOutbound('tel:1234567890', site), false)
    assert.equal(isOutbound('/events', site), false)
    assert.equal(isOutbound('#top', site), false)
    assert.equal(isOutbound('', site), false)
    assert.equal(isOutbound(null, site), false)
    assert.equal(isOutbound('javascript:alert(1)', site), false)
  })

  test('T3.3: createOnce first/second call behavior', () => {
    const seen = createOnce()

    // First call false (not yet seen)
    assert.equal(seen('event:kickstart'), false)
    // Second call true (already seen)
    assert.equal(seen('event:kickstart'), true)
    assert.equal(seen('event:kickstart'), true)

    // Different keys independent
    assert.equal(seen('section:hero'), false)
    assert.equal(seen('section:hero'), true)
    assert.equal(seen('event:kickstart'), true)
  })
})
