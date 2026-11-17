// ==============================================================================
// CLUSTER Society — Pure Interaction Tracking Helpers
// No DOM dependencies. Accepts duck-typed nodes with parentElement & getAttribute.
// ==============================================================================

/**
 * Traverses up the DOM tree (up to 6 levels) looking for data-track attributes.
 * @param {{ getAttribute?: (attr: string) => string|null, parentElement?: any }} node
 * @returns {{ name: string, target: string, slug?: string }|null}
 */
export function findTrackTarget(node) {
  let curr = node
  let level = 0

  while (curr && level <= 6) {
    if (typeof curr.getAttribute === 'function') {
      const trackAttr = curr.getAttribute('data-track')
      if (trackAttr) {
        const target = curr.getAttribute('data-track-target') || trackAttr
        const slug = curr.getAttribute('data-track-slug') || undefined
        return {
          name: trackAttr,
          target,
          slug,
        }
      }
    }
    curr = curr.parentElement
    level++
  }

  return null
}

/**
 * Determines whether a link URL points to an external destination.
 * @param {string} href
 * @param {string} siteHost
 * @returns {boolean}
 */
export function isOutbound(href, siteHost) {
  if (!href || typeof href !== 'string') {
    return false
  }

  const trimmed = href.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false
  }

  try {
    const url = new URL(trimmed)
    let host = url.hostname.toLowerCase().replace(/^www\./, '').split(':')[0]
    let site = (siteHost || '').toLowerCase().replace(/^www\./, '').split(':')[0]

    if (!host || !site) {
      return false
    }

    return host !== site
  } catch {
    return false
  }
}

/**
 * Factory for a stateful seen(key) helper that returns false on the first call, true on subsequent calls.
 * Used for once-per-session element impressions.
 * @returns {(key: string) => boolean}
 */
export function createOnce() {
  const seenSet = new Set()

  return function seen(key) {
    if (seenSet.has(key)) {
      return true
    }
    seenSet.add(key)
    return false
  }
}
