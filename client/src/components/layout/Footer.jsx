import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Github, Instagram, Linkedin, Globe, MessageSquare } from 'lucide-react'
import { ClusterLogo, Square } from '../ui/Brand.jsx'
import { clusterDataService } from '../../services/clusterDataService.js'

// lucide has no X logo, so inline it
const XIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const DiscordIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
)

function getSocialIcon(iconType) {
  switch (iconType) {
    case 'github':
      return Github
    case 'x':
      return XIcon
    case 'instagram':
      return Instagram
    case 'linkedin':
      return Linkedin
    case 'discord':
      return DiscordIcon
    default:
      return Globe
  }
}

const link = 'body-6 text-graphite hover:text-black transition-colors duration-300'

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState(() => clusterDataService.getSocialLinks())

  useEffect(() => {
    const handleUpdate = () => {
      setSocialLinks(clusterDataService.getSocialLinks())
    }
    window.addEventListener('cluster_socials_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('cluster_socials_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Filter channels to display in footer (only enabled, social/community types)
  const activeSocials = socialLinks
    .filter((l) => l.enabled !== false && ['github', 'x', 'instagram', 'linkedin', 'discord'].includes(l.iconType))
    .slice(0, 5)

  return (
    <footer className="relative overflow-hidden px-4 sm:px-8 lg:px-20 pt-24 pb-12">
      {/* Ghost wordmark, half sunk below the edge */}
      <span aria-hidden="true" className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 -bottom-[0.22em] whitespace-nowrap font-bold leading-none tracking-[0.08em] text-black/[0.035] text-[clamp(120px,24vw,400px)]">CLUSTER</span>
      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] reveal">
          <div className="flex flex-col gap-6 max-w-sm">
            <ClusterLogo markClass="w-10 h-10" textClass="text-xl" />
            <p className="body-6 text-graphite">
              A community around compute, anchored by the NVIDIA DGX H200 at Galgotias University, Greater Noida.
            </p>
            {activeSocials.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {activeSocials.map((s) => {
                  const Icon = getSocialIcon(s.iconType)
                  return (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.title}
                      title={s.title}
                      className="lift w-11 h-11 rounded-xl border border-line hover:border-black flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-4">
            <p className="caption-3">Explore</p>
            <Link to="/" className={link}>Home</Link>
            <Link to="/events" className={link}>Events</Link>
            <Link to="/team" className={link}>Team</Link>
            <Link to="/join" className={link}>Apply to join</Link>
          </nav>

          <div className="flex flex-col gap-4">
            <p className="caption-3">Contact</p>
            <a href="mailto:contact@clustersociety.tech" className={link}>contact@clustersociety.tech</a>
            <p className="body-6 text-graphite">Galgotias University<br />Greater Noida, UP 203201</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-line">
          <p className="caption-5 text-graphite flex items-center gap-2">
            © {new Date().getFullYear()} Cluster. Good things happen in clusters. <Square className="w-1.5 h-1.5" />
          </p>
          <Link to="/admin/login" className="caption-5 text-graphite hover:text-black">Admin portal</Link>
        </div>
      </div>
    </footer>
  )
}
