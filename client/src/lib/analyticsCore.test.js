// ==============================================================================
// Unit Tests: analyticsCore.js (Phase 1 Gate: T1.1 - T1.8)
// Uses Node's built-in test runner (node:test)
// ==============================================================================

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyDevice,
  isBot,
  parseUtm,
  classifySource,
  sanitizePath,
  shouldTrack,
  buildEvent,
  createBatcher,
  createErrorThrottler,
} from './analyticsCore.js'

describe('Phase 1: Analytics Core Unit Tests', () => {
  test('T1.1: classifyDevice', () => {
    const iphoneUA =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    const ipadUA =
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    const desktopChrome =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const unknownUA = 'CustomAppClient/1.0'

    assert.equal(classifyDevice(iphoneUA), 'mobile')
    assert.equal(classifyDevice(ipadUA), 'tablet')
    assert.equal(classifyDevice(desktopChrome), 'desktop')
    assert.equal(classifyDevice(unknownUA, 375), 'mobile')
    assert.equal(classifyDevice(unknownUA, 768), 'tablet')
    assert.equal(classifyDevice(unknownUA, 1200), 'desktop')
  })

  test('T1.2: isBot', () => {
    const googleBot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    const headlessChrome =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36'
    const chromeUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    const safariUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'

    assert.equal(isBot(googleBot), true)
    assert.equal(isBot(headlessChrome), true)
    assert.equal(isBot(''), true)
    assert.equal(isBot('   '), true)
    assert.equal(isBot(null), true)
    assert.equal(isBot(undefined), true)
    assert.equal(isBot(chromeUA), false)
    assert.equal(isBot(safariUA), false)
  })

  test('T1.3: parseUtm', () => {
    const query = '?utm_source=IG&utm_campaign=Kickstart'
    const parsed = parseUtm(query)

    assert.equal(parsed.utm_source, 'ig')
    assert.equal(parsed.utm_campaign, 'kickstart')
    assert.equal(parsed.utm_medium, undefined)

    const longVal = 'a'.repeat(300)
    const longParsed = parseUtm(`?utm_source=${longVal}`)
    assert.equal(longParsed.utm_source.length, 100)
  })

  test('T1.4: classifySource', () => {
    // UTM wins over referrer
    const utmWin = classifySource('https://l.instagram.com/x', { utm_source: 'newsletter' }, 'cluster.org')
    assert.equal(utmWin, 'newsletter')

    // Known referrers
    assert.equal(classifySource('https://l.instagram.com/x', {}, 'cluster.org'), 'instagram')
    assert.equal(classifySource('https://www.google.co.in/', {}, 'cluster.org'), 'google')
    assert.equal(classifySource('https://wa.me/12345', {}, 'cluster.org'), 'whatsapp')
    assert.equal(classifySource('https://t.co/abc', {}, 'cluster.org'), 'x')
    assert.equal(classifySource('https://lnkd.in/abc', {}, 'cluster.org'), 'linkedin')
    assert.equal(classifySource('https://youtu.be/abc', {}, 'cluster.org'), 'youtube')
    assert.equal(classifySource('https://reddit.com/r/webdev', {}, 'cluster.org'), 'reddit')
    assert.equal(classifySource('https://github.com/cluster', {}, 'cluster.org'), 'github')

    // Same host with no utm keeps undefined (preserves first-touch)
    assert.equal(classifySource('https://cluster.org/about', {}, 'cluster.org'), undefined)
    assert.equal(classifySource('https://www.cluster.org/events', {}, 'cluster.org'), undefined)

    // No referrer is direct
    assert.equal(classifySource('', {}, 'cluster.org'), 'direct')
    assert.equal(classifySource(null, {}, 'cluster.org'), 'direct')

    // Unknown host returns the host
    assert.equal(classifySource('https://randomblog.xyz/post/1', {}, 'cluster.org'), 'randomblog.xyz')
  })

  test('T1.5: sanitizePath', () => {
    assert.equal(sanitizePath('/join?email=a@b.com#x'), '/join')
    assert.equal(sanitizePath('/events/'), '/events')
    assert.equal(sanitizePath('/'), '/')
    assert.equal(sanitizePath(''), '/')

    const longPath = '/' + 'x'.repeat(500)
    const sanitized = sanitizePath(longPath)
    assert.equal(sanitized.length, 200)
  })

  test('T1.6: shouldTrack', () => {
    assert.equal(shouldTrack({ pathname: '/admin/login' }), false)
    assert.equal(shouldTrack({ pathname: '/admin' }), false)
    assert.equal(shouldTrack({ dnt: '1', pathname: '/' }), false)
    assert.equal(shouldTrack({ adminFlag: '1', pathname: '/' }), false)
    assert.equal(shouldTrack({ disabled: true, pathname: '/' }), false)
    assert.equal(shouldTrack({ disabled: 'true', pathname: '/' }), false)
    assert.equal(shouldTrack({ optOut: true, pathname: '/' }), false)
    assert.equal(shouldTrack({ optOut: false, pathname: '/' }), true)
    assert.equal(shouldTrack({ pathname: '/events' }), true)
    assert.equal(shouldTrack({ pathname: '/' }), true)
  })

  test('T1.7: buildEvent', () => {
    // Invalid event_type throws
    assert.throws(() => {
      buildEvent({ event_type: 'hack', path: '/' })
    }, /Invalid event_type/)

    // Drops unknown keys & truncates long strings
    const event = buildEvent({
      event_type: 'pageview',
      session_id: 'a'.repeat(100),
      path: '/events/' + 'b'.repeat(300),
      target: 'c'.repeat(300),
      source: 'd'.repeat(150),
      secret_user_token: 'should_be_dropped',
      device: 'mobile',
      meta: { ok: true },
    })

    assert.equal(event.event_type, 'pageview')
    assert.equal(event.session_id.length, 64)
    assert.equal(event.path.length, 200)
    assert.equal(event.target.length, 200)
    assert.equal(event.source.length, 100)
    assert.equal(event.secret_user_token, undefined)
    assert.equal(event.device, 'mobile')
    assert.deepEqual(event.meta, { ok: true })

    // Oversized meta (> 1024 bytes) is reduced under 1024 bytes
    const hugeMeta = {}
    for (let i = 0; i < 50; i++) {
      hugeMeta[`key_${i}`] = 'x'.repeat(50)
    }
    const hugeEvent = buildEvent({
      event_type: 'click',
      meta: hugeMeta,
    })
    const byteLength = new TextEncoder().encode(JSON.stringify(hugeEvent.meta)).length
    assert.ok(byteLength <= 1024)
  })

  test('T1.8: createBatcher with fake timers', () => {
    let sentBatches = []
    let scheduledTimerCallback = null
    let activeTimerId = null
    let nextTimerId = 1

    const fakeSetTimer = (cb) => {
      scheduledTimerCallback = cb
      activeTimerId = nextTimerId++
      return activeTimerId
    }

    const fakeClearTimer = (id) => {
      if (activeTimerId === id) {
        activeTimerId = null
        scheduledTimerCallback = null
      }
    }

    const batcher = createBatcher({
      send: (batch) => {
        sentBatches.push(batch)
      },
      maxSize: 10,
      flushMs: 3000,
      setTimer: fakeSetTimer,
      clearTimer: fakeClearTimer,
    })

    // 10 adds trigger one send of 10
    for (let i = 0; i < 10; i++) {
      batcher.add({ id: i })
    }
    assert.equal(sentBatches.length, 1)
    assert.equal(sentBatches[0].length, 10)

    // 3 adds then timer fire sends 3
    batcher.add({ id: 11 })
    batcher.add({ id: 12 })
    batcher.add({ id: 13 })
    assert.equal(sentBatches.length, 1) // not yet sent
    assert.ok(scheduledTimerCallback !== null)

    // Fire fake timer
    scheduledTimerCallback()
    assert.equal(sentBatches.length, 2)
    assert.equal(sentBatches[1].length, 3)

    // flush() on empty sends nothing
    batcher.flush()
    assert.equal(sentBatches.length, 2)

    // Send error does not throw
    const errorBatcher = createBatcher({
      send: () => {
        throw new Error('Network failure')
      },
      maxSize: 2,
    })
    assert.doesNotThrow(() => {
      errorBatcher.add({ id: 1 })
      errorBatcher.add({ id: 2 }) // triggers flush
    })
  })

  test('T5.2: createErrorThrottler drops 6th error and truncates messages over 200 chars', () => {
    const throttle = createErrorThrottler(5)

    // First 5 errors allowed
    for (let i = 1; i <= 5; i++) {
      const res = throttle(`Error ${i}`)
      assert.ok(res !== null)
      assert.equal(res.msg, `Error ${i}`)
    }

    // 6th error dropped
    const sixth = throttle('Error 6')
    assert.equal(sixth, null)

    // 7th error dropped
    const seventh = throttle('Error 7')
    assert.equal(seventh, null)

    // Truncates long messages over 200 characters
    const freshThrottle = createErrorThrottler(5)
    const longMsg = 'X'.repeat(350)
    const res = freshThrottle(longMsg)
    assert.equal(res.msg.length, 200)
    assert.equal(res.msg, 'X'.repeat(200))
  })
})
