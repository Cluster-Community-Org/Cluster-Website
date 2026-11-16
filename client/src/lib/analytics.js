// ==============================================================================
// CLUSTER Society — Browser Analytics Glue
// Wires analyticsCore to browser DOM, sessionStorage, and Supabase REST.
// ==============================================================================

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
import {
  findTrackTarget,
  isOutbound,
  createOnce,
} from './analyticsTrack.js'
import { onLCP, onCLS, onINP } from 'web-vitals'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

const IS_DISABLED =
  import.meta.env.VITE_ANALYTICS_DISABLED === 'true' ||
  import.meta.env.VITE_ANALYTICS_DISABLED === true

const IS_DEBUG =
  import.meta.env.VITE_ANALYTICS_DEBUG === 'true' ||
  import.meta.env.VITE_ANALYTICS_DEBUG === true

const isConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_KEY &&
    SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    !SUPABASE_URL.includes('your-project')
)

function getSessionId() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return 'fallback_server_session'
  }
  try {
    let sid = window.sessionStorage.getItem('cluster_sid')
    if (!sid) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sid = crypto.randomUUID()
      } else {
        sid =
          'cs_' +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)
      }
      window.sessionStorage.setItem('cluster_sid', sid)
    }
    return sid
  } catch {
    return 'fallback_session'
  }
}

function getFirstTouchAttribution() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return {}
  }
  try {
    const raw = window.sessionStorage.getItem('cluster_src')
    if (raw) {
      return JSON.parse(raw)
    }

    const utm = parseUtm(window.location.search)
    const source = classifySource(
      document.referrer,
      utm,
      window.location.hostname
    )

    const attribution = {
      source,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
    }

    window.sessionStorage.setItem('cluster_src', JSON.stringify(attribution))
    return attribution
  } catch {
    return {}
  }
}

// Low-level sender posting event batch to Supabase REST endpoint
async function sendBatch(batch) {
  if (!isConfigured || !batch || batch.length === 0) return

  const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/page_events`
  try {
    await fetch(endpoint, {
      method: 'POST',
      keepalive: true,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(batch),
    })
  } catch {
    // Swallow network errors; analytics should never throw or break UI
  }
}

// Batcher instance
const batcher = createBatcher({
  send: sendBatch,
  maxSize: 10,
  flushMs: 3000,
})

// Impression tracker & observer
const seenImpression = createOnce()
let impressionObserver = null

export function scanTrackableElements() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!('IntersectionObserver' in window)) return

  if (!impressionObserver) {
    impressionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const el = entry.target
            const impAttr = el.getAttribute('data-impression')
            const secAttr = el.getAttribute('data-section')
            const targetKey = impAttr || (secAttr ? `section:${secAttr}` : null)

            if (targetKey && !seenImpression(targetKey)) {
              track('impression', targetKey)
            }
          }
        })
      },
      { threshold: 0.5 }
    )
  }

  const elements = document.querySelectorAll('[data-impression], [data-section]')
  elements.forEach((el) => impressionObserver.observe(el))
}

// Setup visibility, page unload, click delegation & mutation observer once in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      batcher.flush()
    }
  })
  window.addEventListener('pagehide', () => {
    batcher.flush()
  })

  // Delegated click listener in capture phase (Task 2)
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target
      if (!target) return

      // 1. Check for data-track in hierarchy up to 6 levels
      const trackInfo = findTrackTarget(target)
      if (trackInfo) {
        track(
          'click',
          trackInfo.target,
          trackInfo.slug ? { slug: trackInfo.slug } : {}
        )
        return
      }

      // 2. Check for outbound hyperlinks
      let anchor = target
      while (anchor && anchor.tagName !== 'A' && anchor !== document.body) {
        anchor = anchor.parentElement
      }
      if (anchor && anchor.tagName === 'A' && anchor.href) {
        if (isOutbound(anchor.href, window.location.hostname)) {
          try {
            const parsed = new URL(anchor.href)
            track('click', 'outbound', { host: parsed.hostname })
          } catch {
            // ignore
          }
        }
      }
    },
    true
  )

  // Scan after initial DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scanTrackableElements()
    })
  } else {
    setTimeout(scanTrackableElements, 100)
  }

  // Error throttling: max 5 per session, messages truncated to 200 chars
  const throttleError = createErrorThrottler(5)

  window.addEventListener('error', (event) => {
    const msg = event?.message || (typeof event === 'string' ? event : 'Script error')
    const res = throttleError(msg)
    if (res) {
      track('error', 'js', { msg: res.msg })
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason
    const msg =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
        ? reason
        : 'Unhandled rejection'
    const res = throttleError(msg)
    if (res) {
      track('error', 'js', { msg: res.msg })
    }
  })

  // Core Web Vitals: report LCP, CLS, INP once per page load
  const sendVital = (metric) => {
    if (!metric || !metric.name) return
    track('vital', metric.name, {
      value: Math.round(metric.value * 1000) / 1000,
      rating: metric.rating,
      id: metric.id,
    })
  }

  try {
    onLCP(sendVital)
    onCLS(sendVital)
    onINP(sendVital)
  } catch {
    // web-vitals safe fallback
  }
}

/**
 * Tracks an analytics event.
 * @param {'pageview'|'click'|'impression'|'form_step'|'vital'|'error'} type
 * @param {string} [target]
 * @param {Object} [meta]
 */
export function track(type, target, meta = {}) {
  if (typeof window === 'undefined') return

  const pathname = window.location.pathname
  const dnt = navigator.doNotTrack || window.doNotTrack
  let adminFlag = '0'
  try {
    adminFlag = localStorage.getItem('cluster_no_track')
  } catch {
    // ignore
  }

  if (
    !shouldTrack({
      disabled: IS_DISABLED,
      dnt,
      adminFlag,
      pathname,
    })
  ) {
    return
  }

  const attribution = getFirstTouchAttribution()
  const sessionId = getSessionId()
  const userAgent = navigator.userAgent || ''
  const device = classifyDevice(userAgent, window.innerWidth)
  const bot = isBot(userAgent)

  try {
    const event = buildEvent(
      {
        event_type: type,
        target,
        meta,
      },
      {
        session_id: sessionId,
        path: sanitizePath(pathname),
        source: attribution.source,
        referrer: document.referrer ? document.referrer.slice(0, 300) : undefined,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        device,
        is_bot: bot,
      }
    )

    if (IS_DEBUG) {
      console.debug('[Analytics Tracked]', event)
    }

    batcher.add(event)
  } catch (err) {
    if (IS_DEBUG) {
      console.warn('[Analytics Error]', err)
    }
  }
}

/**
 * Convenience helper to track pageviews.
 */
export function trackPageview() {
  track('pageview')
}

/**
 * Flush any queued events immediately.
 */
export function flushAnalytics() {
  batcher.flush()
}
