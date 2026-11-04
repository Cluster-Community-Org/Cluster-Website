import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, UserPlus, Home, Calendar, Users, Shield, ArrowRight } from 'lucide-react'
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

  // Lock body scroll and listen for Escape key when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const navLinks = [
    { name: 'Home',   href: '/',       icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Team',   href: '/team',   icon: Users },
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
          <nav className="hidden md:flex items-center gap-1 bg-[#0C0D0E]/90 p-1.5 rounded-full border border-white/10 backdrop-blur-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                className={({ isActive }) =>
                  `px-5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'bg-cluster-acid text-black font-bold shadow-[0_0_20px_rgba(198,255,77,0.35)]'
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
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Slide-Over Sidebar Drawer ── */}
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Content */}
            <div className="relative w-72 max-w-[85vw] h-full bg-[#0C0D0E] border-l border-white/10 flex flex-col justify-between p-6 z-10 shadow-2xl animate-fadeIn">
              <div className="space-y-6">
                {/* Header with Close */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <ClusterLogo to="/" size="sm" showTagline={false} />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <NavLink
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-medium transition-all ${
                            isActive
                              ? 'bg-cluster-acid text-black font-bold shadow-[0_0_20px_rgba(198,255,77,0.3)]'
                              : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </NavLink>
                    )
                  })}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setIsJoinModalOpen(true)
                  }}
                  className="btn-cluster-primary w-full py-3 text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join CLUSTER Community</span>
                </button>

                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[11px] font-mono text-gray-400 hover:text-cluster-acid transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Access</span>
                  </span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
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

