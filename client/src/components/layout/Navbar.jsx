import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, UserPlus, Terminal as TerminalIcon } from 'lucide-react'
import TerminalModal from '../TerminalModal.jsx'

// CLUSTER official logo asset from brand kit
const LOGO_URL = "/cluster-logo.jpg"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
            ? 'bg-obsidian-950/95 backdrop-blur-md border-b border-cluster-green/25 py-3 shadow-cluster-glow'
            : 'bg-transparent py-5 border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">

          {/* ── Brand Logo ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-obsidian-900 border border-cluster-green/40 p-1 flex items-center justify-center shrink-0 shadow-cluster-glow group-hover:border-cluster-green transition-all duration-300">
              <img
                src={LOGO_URL}
                alt="CLUSTER Logo"
                className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base sm:text-lg text-white tracking-widest leading-none">
                CLUSTER
              </span>
              <span className="text-[9px] tracking-[0.2em] text-gray-300 font-mono uppercase leading-tight mt-0.5">
                A Student Technology Society
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav pill ── */}
          <nav className="hidden md:flex items-center gap-1 bg-obsidian-900/90 p-1.5 rounded-full border border-white/15 backdrop-blur-md absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-xs font-semibold font-mono tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'nav-pill-active'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* ── Action Buttons ── */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsTerminalOpen(true)}
              className="px-3.5 py-2.5 rounded-lg bg-obsidian-900 border border-cluster-green/40 text-cluster-green text-xs font-mono font-semibold hover:bg-cluster-green/10 hover:border-cluster-green transition-all flex items-center gap-2 shadow-cluster-glow"
              aria-label="Open CLI Terminal"
            >
              <TerminalIcon className="w-4 h-4" />
              <span>CLI Terminal</span>
            </button>

            <Link
              to="/events"
              className="btn-cluster-primary px-5 py-2.5 rounded-lg text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join CLUSTER</span>
            </Link>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-obsidian-900 border border-white/10 text-gray-300 hover:text-cluster-green focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        {isOpen && (
          <div className="md:hidden bg-obsidian-900 border-b border-cluster-green/25 px-4 pt-4 pb-6 mt-3 space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.href}
                end={link.href === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'nav-pill-active'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span>{link.name}</span>
              </NavLink>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => { setIsOpen(false); setIsTerminalOpen(true) }}
                className="w-full py-3 bg-obsidian-950 border border-cluster-green/35 text-cluster-green font-mono font-bold rounded-lg flex items-center justify-center gap-2 shadow-cluster-glow"
              >
                <TerminalIcon className="w-4 h-4" />
                <span>Open CLI Terminal</span>
              </button>
              <Link
                to="/events"
                onClick={() => setIsOpen(false)}
                className="btn-cluster-primary w-full py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join CLUSTER</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <TerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
    </>
  )
}
