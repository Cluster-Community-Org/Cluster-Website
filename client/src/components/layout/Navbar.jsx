import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ClusterLogo } from '../ui/Brand.jsx'

const LINKS = [
  { name: 'Home', to: '/' },
  { name: 'Events', to: '/events' },
  { name: 'Team', to: '/team' },
]

const line = 'absolute left-1/2 h-0.5 w-5 -ml-2.5 bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 h-20 flex items-center justify-center px-4 pointer-events-none">
      <nav aria-label="Main" className="relative z-10 pointer-events-auto w-full md:w-auto flex items-center justify-between gap-6 rounded-full border border-black/10 bg-paper/80 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.06)] py-2 pr-2 pl-4">
        <ClusterLogo data-build="fade" />

        <ul className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.to} data-build="">
              <NavLink
                to={l.to}
                end
                className={({ isActive }) =>
                  `title-4 rounded-full px-3 py-2 transition-colors duration-300 ${isActive ? 'bg-black text-white' : 'text-graphite hover:bg-black/5 hover:text-black'}`
                }
              >
                {l.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/join" data-build="" className="btn btn-lime btn-sm" onClick={() => setOpen(false)}>
            <span>Apply<span className="hidden sm:inline"> to join</span></span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden relative w-9 h-9 rounded-full border border-black/10"
          >
            <span className={`${line} top-[13px] ${open ? 'translate-y-[4px] rotate-45' : ''}`} />
            <span className={`${line} top-[21px] ${open ? '-translate-y-[4px] -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="md:hidden fixed inset-0 pointer-events-auto bg-paper/95 backdrop-blur-xl px-6 pt-28 pb-12 flex flex-col">
          <ul className="flex flex-col gap-2">
            {LINKS.map((l, i) => (
              <li key={l.to} className="rise" style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}>
                <NavLink
                  to={l.to}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `heading-3 flex items-center justify-between py-3 border-b border-line ${isActive ? 'text-black' : 'text-graphite'}`}
                >
                  {({ isActive }) => (
                    <>
                      {l.name}
                      {isActive && <span aria-hidden="true" className="w-3 h-3 bg-lime" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/admin/login" onClick={() => setOpen(false)} className="mt-auto body-6 text-graphite rise" style={{ animationDelay: '240ms' }}>
            Admin portal
          </Link>
        </div>
      )}
    </header>
  )
}
