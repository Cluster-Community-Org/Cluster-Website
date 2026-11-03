import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, X } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'

export default function AnnouncementBanner() {
  const [config, setConfig] = useState(() => clusterDataService.getHomepageConfig())
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(clusterDataService.getHomepageConfig())
    }
    window.addEventListener('cluster_homepage_updated', handleUpdate)
    return () => window.removeEventListener('cluster_homepage_updated', handleUpdate)
  }, [])

  if (!config.bannerEnabled || dismissed || !config.bannerText) return null

  return (
    <div className="bg-[#0C0D0E] border-b border-cluster-acid/25 text-[#F8F7F3] text-[11px] sm:text-xs font-mono py-2 px-4 relative z-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate mx-auto text-center">
          <span className="w-1.5 h-1.5 rounded-sm bg-cluster-acid shrink-0 hidden sm:inline-block" />
          <span className="text-[#C2C2B8] truncate">{config.bannerText}</span>
          {config.bannerLink && (
            <Link
              to={config.bannerLink}
              className="text-cluster-acid hover:text-white font-bold ml-1.5 inline-flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>{config.bannerLinkText || 'Learn more'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#8E8E88] hover:text-white p-0.5 shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
