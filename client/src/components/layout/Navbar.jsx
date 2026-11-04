import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, UserPlus } from 'lucide-react'
import ClusterLogo from '../ui/ClusterLogo.jsx'
import JoinClusterModal from '../modals/JoinClusterModal.jsx'
import AnnouncementBanner from './AnnouncementBanner.jsx'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    const handleOpenJoin = () => setIsJoinModalOpen(true)

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('open_join_modal', handleOpenJoin)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('open_join_modal', handleOpenJoin)
    }
  }, [])

  const navLinks = [
    { name: 'Home',   href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Team',   href: '/team' },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-black/85 backdrop-blur-md border-b border-white/[0.08]'
        }`}
      >
        {/* Top Ticker Alert Banner (if enabled) */}
        <AnnouncementBanner />

        {/* Main Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">

          {/* ── Brand Logo ── */}
          <ClusterLogo
            to="/"
            size="md"
            showTagline={true}
            tagline="Community Around Compute"
          />

          {/* ── Desktop Nav pill (Perfect Horizontal and Vertical Center) ── */}
          <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/90 p-1.5 rounded-full border border-white/10 backdrop-blur-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className={({ isActive }) =>
                  `px-5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'nav-pill-active'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* ── Right Action Controls ── */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="btn-cluster-primary px-5 py-2 text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join CLUSTER</span>
            </button>
          </div>

          {/* ── Mobile Hamburger ── */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-obsidian-900 text-gray-300 hover:text-white border border-white/10"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav Dropdown ── */}
        {isOpen && (
          <div className="md:hidden bg-black/98 border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-xs font-mono transition-colors ${
                      isActive
                        ? 'nav-pill-active'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsJoinModalOpen(true)
                }}
                className="btn-cluster-primary w-full py-2.5 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join CLUSTER Community</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Join Community Modal */}
      <JoinClusterModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </>
  )
}
