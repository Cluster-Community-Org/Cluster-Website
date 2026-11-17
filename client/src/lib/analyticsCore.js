// ==============================================================================
// CLUSTER Society — Pure Analytics Core
// No DOM or Supabase dependencies. 100% unit-testable in pure Node.
// ==============================================================================

export const CONSENT_KEY = 'cluster_consent' // 'accept' | 'decline'

const VALID_EVENT_TYPES = new Set([
  'pageview',
  'click',
  'impression',
  'form_step',
  'vital',
  'error',
])

/**
 * Classifies a client device into 'mobile', 'tablet', or 'desktop'.
 * @param {string} userAgent
 * @param {number} [viewportWidth]
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function classifyDevice(userAgent, viewportWidth) {
  const ua = (userAgent || '').toLowerCase()

  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet'
  }
  if (/iphone|ipod|mobile/i.test(ua)) {
    return 'mobile'
  }
  if (/windows|macintosh|linux|cros/i.test(ua)) {
    return 'desktop'
  }

  // Fallback based on viewport width for unknown UAs
  if (typeof viewportWidth === 'number') {
    if (viewportWidth < 640) return 'mobile'
    if (viewportWidth < 1024) return 'tablet'
    return 'desktop'
  }

  return 'desktop'
}

/**
 * Checks if the user agent represents a crawler/bot.
 * @param {string} userAgent
 * @returns {boolean}
 */
export function isBot(userAgent) {
  if (!userAgent || typeof userAgent !== 'string' || userAgent.trim() === '') {
    return true
  }
  return /bot|crawl|spider|slurp|lighthouse|preview|facebookexternalhit|headlesschrome/i.test(
    userAgent
  )
}

/**
 * Extracts and normalizes UTM parameters from a search query string.
 * @param {string} searchString - e.g. "?utm_source=IG&utm_campaign=Kickstart"
 * @returns {{ utm_source: string|undefined, utm_medium: string|undefined, utm_campaign: string|undefined }}
 */
export function parseUtm(searchString) {
  const query = searchString || ''
  const searchParams = new URLSearchParams(query.startsWith('?') ? query : '?' + query)

  const getParam = (key) => {
    const val = searchParams.get(key)
    return val ? val.trim().toLowerCase().slice(0, 100) : undefined
  }

  return {
    utm_source: getParam('utm_source'),
    utm_medium: getParam('utm_medium'),
    utm_campaign: getParam('utm_campaign'),
  }
}

/**
 * Classifies referral traffic source.
 * @param {string} referrer
 * @param {{ utm_source?: string }} [utm]
 * @param {string} [siteHost]
 * @returns {string|undefined}
 */
export function classifySource(referrer, utm, siteHost) {
  if (utm && utm.utm_source) {
    return String(utm.utm_source).toLowerCase().slice(0, 100)
  }

  if (!referrer || typeof referrer !== 'string' || referrer.trim() === '') {
    return 'direct'
  }

  let refHost = ''
  try {
    const parsed = new URL(referrer.startsWith('http') ? referrer : `https://${referrer}`)
    refHost = parsed.hostname.toLowerCase()
  } catch {
    refHost = referrer.toLowerCase()
  }

  // Strip leading www.
  refHost = refHost.replace(/^www\./, '')

  if (siteHost) {
    let cleanSite = siteHost.toLowerCase().replace(/^www\./, '')
    // Strip port if present
    cleanSite = cleanSite.split(':')[0]
    const cleanRef = refHost.split(':')[0]
    if (cleanRef === cleanSite) {
      return undefined
    }
  }

  if (/(\.|\b)instagram\.com$/i.test(refHost) || refHost === 'l.instagram.com') {
    return 'instagram'
  }
  if (
    refHost === 'wa.me' ||
    refHost === 'web.whatsapp.com' ||
    /(\.|\b)whatsapp\.com$/i.test(refHost)
  ) {
    return 'whatsapp'
  }
  if (/(\.|\b)google\.[a-z.]+$/i.test(refHost) || refHost === 'google') {
    return 'google'
  }
  if (refHost === 't.co' || refHost === 'twitter.com' || refHost === 'x.com') {
    return 'x'
  }
  if (refHost === 'lnkd.in' || /(\.|\b)linkedin\.com$/i.test(refHost)) {
    return 'linkedin'
  }
  if (refHost === 'youtu.be' || /(\.|\b)youtube\.com$/i.test(refHost)) {
    return 'youtube'
  }
  if (/(\.|\b)reddit\.com$/i.test(refHost)) {
    return 'reddit'
  }
  if (/(\.|\b)github\.com$/i.test(refHost)) {
    return 'github'
  }

  return refHost.slice(0, 100)
}

/**
 * Strips query string and hash from pathname, removes trailing slash (except root), and caps at 200 chars.
 * @param {string} pathname
 * @returns {string}
 */
export function sanitizePath(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return '/'
  }

  let clean = pathname.split('#')[0].split('?')[0].trim()

  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.replace(/\/+$/, '')
  }

  if (clean === '') {
    clean = '/'
  }

  return clean.slice(0, 200)
}

/**
 * Determines whether analytics collection should run.
 * @param {{ disabled?: boolean|string, dnt?: string|number, adminFlag?: boolean|string|number, optOut?: boolean, pathname?: string }} ctx
 * @returns {boolean}
 */
export function shouldTrack({ disabled, dnt, adminFlag, optOut, pathname } = {}) {
  if (optOut === true) {
    return false
  }
  if (disabled === true || disabled === 'true') {
    return false
  }
  if (dnt === '1' || dnt === 1) {
    return false
  }
  if (adminFlag === true || adminFlag === '1' || adminFlag === 1) {
    return false
  }
  if (pathname && typeof pathname === 'string' && pathname.startsWith('/admin')) {
    return false
  }
  return true
}

/**
 * Enforces schema constraints and drops extra fields for page_events.
 * @param {Object} partial
 * @param {Object} [ctx]
 * @returns {Object}
 */
export function buildEvent(partial, ctx = {}) {
  const merged = { ...ctx, ...partial }

  if (!merged.event_type || !VALID_EVENT_TYPES.has(merged.event_type)) {
    throw new Error(`Invalid event_type: ${merged.event_type}`)
  }

  const truncate = (val, max) =>
    typeof val === 'string' ? val.slice(0, max) : undefined

  let meta = merged.meta && typeof merged.meta === 'object' ? { ...merged.meta } : {}

  const encoder = new TextEncoder()
  const getByteLength = (m) => encoder.encode(JSON.stringify(m)).length

  if (getByteLength(meta) > 1024) {
    const keys = Object.keys(meta)
    while (keys.length > 0 && getByteLength(meta) > 1024) {
      delete meta[keys.pop()]
    }
    if (getByteLength(meta) > 1024) {
      meta = {}
    }
  }

  const device =
    merged.device && ['mobile', 'tablet', 'desktop'].includes(merged.device)
      ? merged.device
      : undefined

  const event = {
    session_id: truncate(merged.session_id, 64) || 'anonymous',
    event_type: merged.event_type,
    path: sanitizePath(merged.path || '/'),
    is_bot: Boolean(merged.is_bot),
    meta,
  }

  if (merged.target) event.target = truncate(merged.target, 200)
  if (merged.source) event.source = truncate(merged.source, 100)
  if (merged.referrer) event.referrer = truncate(merged.referrer, 300)
  if (merged.utm_source) event.utm_source = truncate(merged.utm_source, 100)
  if (merged.utm_medium) event.utm_medium = truncate(merged.utm_medium, 100)
  if (merged.utm_campaign) event.utm_campaign = truncate(merged.utm_campaign, 100)
  if (device) event.device = device

  return event
}

/**
 * Batches events and flushes either when full or when the timer expires.
 * @param {{ send: (events: Array) => void|Promise<any>, maxSize?: number, flushMs?: number, setTimer?: Function, clearTimer?: Function }} options
 */
export function createBatcher({
  send,
  maxSize = 10,
  flushMs = 3000,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  let queue = []
  let timerId = null

  const flush = () => {
    if (timerId !== null) {
      clearTimer(timerId)
      timerId = null
    }

    if (queue.length === 0) return

    const batch = queue.splice(0)
    try {
      const res = send(batch)
      if (res && typeof res.catch === 'function') {
        res.catch(() => {})
      }
    } catch {
      // Swallowed: analytics must never throw or break caller
    }
  }

  const add = (event) => {
    queue.push(event)

    if (queue.length >= maxSize) {
      flush()
    } else if (timerId === null) {
      timerId = setTimer(() => {
        timerId = null
        flush()
      }, flushMs)
    }
  }

  return {
    add,
    flush,
    getQueue: () => [...queue],
  }
}

/**
 * Factory for throttling client errors to a maximum per session and truncating messages to 200 chars.
 * @param {number} [maxErrors=5]
 * @returns {(msg: any) => { msg: string }|null}
 */
export function createErrorThrottler(maxErrors = 5) {
  let count = 0
  return function throttleError(msg) {
    if (count >= maxErrors) return null
    count++
    const text = typeof msg === 'string' ? msg : String(msg || 'Unknown error')
    return {
      msg: text.slice(0, 200),
    }
  }
}
