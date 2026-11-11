import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { useLive } from '../../hooks/useLive.js'
import { eventStart } from '../../lib/eventStart.js'
import { nextEvent, untilLabel } from '../../lib/nextEvent.js'

// Announces the next upcoming event; the admin's custom message only shows when nothing is scheduled.
export default function AnnouncementBanner() {
  const config = useLive('cluster_homepage_updated', () => clusterDataService.getHomepageConfig())
  const event = useLive('cluster_events_updated', () => nextEvent(clusterDataService.getEvents()))
  const [dismissed, setDismissed] = useState(false)

  let text = config.bannerText
  let link = config.bannerLink
  let linkText = config.bannerLinkText || 'See more'
  if (event) {
    const start = eventStart(event)
    const date = start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    text = `${event.title} · ${date} · ${untilLabel(start)}`
    link = '/events'
    linkText = 'See details'
  }

  if (!config.bannerEnabled || dismissed || !text) return null

  return (
    <div className="bg-black text-soft">
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2">
        <p className="body-6 flex-1 truncate text-center">
          <span aria-hidden="true" className="inline-block w-2 h-2 mr-2 bg-lime" />
          {text}
          {link && (
            <Link to={link} className="ml-2 font-semibold text-lime hover:text-white">
              {linkText}
            </Link>
          )}
        </p>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss announcement" className="p-2 rounded-full hover:bg-char-2 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
