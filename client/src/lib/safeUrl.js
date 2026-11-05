// Returns a normalized http(s) URL, or null for anything else. Stops javascript: and data: links reaching an href.
export function getSafeUrl(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const trimmed = url.trim()
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.href
  } catch {
    // Not parseable as a URL
  }
  return null
}
