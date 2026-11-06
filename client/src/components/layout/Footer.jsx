import { Link } from 'react-router-dom'
import { Github, Instagram } from 'lucide-react'
import { ClusterLogo, Square } from '../ui/Brand.jsx'

// lucide has no X logo, so inline it
const XIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const SOCIALS = [
  { href: 'https://github.com/Cluster-Community-Org', label: 'Cluster on GitHub', Icon: Github },
  { href: 'https://x.com/the_clusterclub', label: 'Cluster on X', Icon: XIcon },
  { href: 'https://www.instagram.com/theclustercommunity', label: 'Cluster on Instagram', Icon: Instagram },
]

const link = 'body-6 text-graphite hover:text-black transition-colors duration-300'

export default function Footer() {
  return (
    <footer className="px-4 sm:px-8 lg:px-20 pt-24 pb-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] reveal">
          <div className="flex flex-col gap-6 max-w-sm">
            <ClusterLogo markClass="w-10 h-10" textClass="text-xl" />
            <p className="body-6 text-graphite">
              A community around compute, anchored by the NVIDIA DGX H200 at Galgotias University, Greater Noida.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="lift w-11 h-11 rounded-xl border border-line hover:border-black flex items-center justify-center"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
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
