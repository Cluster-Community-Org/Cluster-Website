import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, UserPlus } from 'lucide-react'
import ClusterLogo from '../ui/ClusterLogo.jsx'
import JoinClusterModal from '../modals/JoinClusterModal.jsx'

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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-white/10 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">

          {/* ── Brand Logo ── */}
          <ClusterLogo
            to="/"
            size="md"
            showTagline={true}
            tagline="Community Around Compute"
          />

          {/* ── Desktop Nav pill ── */}
          <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/90 p-1.5 rounded-full border border-white/10 backdrop-blur-md absolute left-1/2 -translate-x-1/2">
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
                    `px-4 py-2.5 rounded-lg text-sm font-mono transition-colors ${
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

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsJoinModalOpen(true)
                }}
                className="btn-cluster-primary w-full py-3 text-xs flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join CLUSTER Community</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Join Society Modal */}
      <JoinClusterModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </>
  )
}
