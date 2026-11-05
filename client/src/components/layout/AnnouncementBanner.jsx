import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { useLive } from '../../hooks/useLive.js'

export default function AnnouncementBanner() {
  const config = useLive('cluster_homepage_updated', () => clusterDataService.getHomepageConfig())
  const [dismissed, setDismissed] = useState(false)

  if (!config.bannerEnabled || dismissed || !config.bannerText) return null

  return (
    <div className="bg-black text-soft">
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2">
        <p className="body-6 flex-1 truncate text-center">
          <span aria-hidden="true" className="inline-block w-2 h-2 mr-2 bg-lime" />
          {config.bannerText}
          {config.bannerLink && (
            <Link to={config.bannerLink} className="ml-2 font-semibold text-lime hover:text-white">
              {config.bannerLinkText || 'See more'}
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
