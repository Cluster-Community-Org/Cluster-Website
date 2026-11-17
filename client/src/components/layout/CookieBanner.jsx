import { useEffect, useState } from 'react'
import { Square } from '../ui/Brand.jsx'
import { CONSENT_KEY } from '../../lib/analyticsCore.js'

export const CONSENT_RESET = 'cluster_consent_reset'

// Visits are counted anonymously with no cookies, so the banner informs and lets people opt out.
// A stored choice hides it; the footer's "Analytics choice" link brings it back.
function hasChoice() {
  try {
    return Boolean(localStorage.getItem(CONSENT_KEY))
  } catch {
    return true // storage blocked: a choice can't be saved, so don't nag on every page
  }
}

export default function CookieBanner() {
  const [open, setOpen] = useState(() => !hasChoice())

  useEffect(() => {
    const reopen = () => setOpen(true)
    window.addEventListener(CONSENT_RESET, reopen)
    return () => window.removeEventListener(CONSENT_RESET, reopen)
  }, [])

  const choose = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      // ignore
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <section role="region" aria-labelledby="consent-heading" className="rise fixed z-40 bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm rounded-2xl border border-graphite bg-black text-soft p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 id="consent-heading" className="title-4 text-white flex items-center gap-2">
          <Square className="w-2 h-2" />
          Counting visits, not people
        </h2>
        <p className="body-6">We count visits anonymously to see what is useful. No cookies, no personal data. Opt out and we count nothing from your browser.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => choose('accept')} className="btn btn-lime btn-sm">Got it</button>
        <button type="button" onClick={() => choose('decline')} className="btn btn-ghost-dark btn-sm">Opt out</button>
      </div>
    </section>
  )
}
