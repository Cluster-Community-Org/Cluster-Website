import { useState, useEffect, useMemo } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCheck,
  Monitor,
  Search,
  PanelLeftClose,
  PanelLeft,
  Shield,
  Activity,
} from 'lucide-react'
import { ClusterMark } from '../components/ui/Brand.jsx'
import CommandPalette from '../components/admin/CommandPalette.jsx'
import { clusterDataService } from '../services/clusterDataService.js'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('cluster_admin_sidebar_collapsed') === 'true'
  })
  const [pendingApplications, setPendingApplications] = useState(() => {
    const apps = clusterDataService.getApplications()
    return apps.filter((a) => (a.status || 'Pending').toLowerCase() === 'pending').length
  })

  const navigate = useNavigate()
  const location = useLocation()
  const auth = JSON.parse(localStorage.getItem('cluster_admin_auth') || 'null')

  // Auth guard
  useEffect(() => {
    if (!auth) {
      navigate('/admin/login')
    }
  }, [auth, navigate])

  // Real-time pending applications count listener
  useEffect(() => {
    const updatePending = () => {
      const apps = clusterDataService.getApplications()
      setPendingApplications(apps.filter((a) => (a.status || 'Pending').toLowerCase() === 'pending').length)
    }
    window.addEventListener('cluster_applications_updated', updatePending)
    return () => window.removeEventListener('cluster_applications_updated', updatePending)
  }, [])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // Global Ctrl+K / Cmd+K & Escape keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('cluster_admin_sidebar_collapsed', String(next))
      return next
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('cluster_admin_auth')
    navigate('/admin/login')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Events CMS', href: '/admin/events', icon: Calendar },
    { name: 'Team CMS', href: '/admin/team', icon: Users },
    { name: 'Applications', href: '/admin/applications', icon: UserCheck, badge: pendingApplications },
    { name: 'Homepage CMS', href: '/admin/homepage', icon: Monitor },
  ]

  // Section title based on current route
  const currentSection = useMemo(() => {
    if (location.pathname.includes('/admin/events')) {
      return { title: 'Events Management', subtitle: 'Hackathons, workshops & spotlight countdown' }
    }
    if (location.pathname.includes('/admin/team')) {
      return { title: 'Team Directory', subtitle: 'Executive board roster & domain leads' }
    }
    if (location.pathname.includes('/admin/applications')) {
      return { title: 'Candidate Pipeline', subtitle: 'Student applications & recruitment reviews' }
    }
    if (location.pathname.includes('/admin/homepage')) {
      return { title: 'Homepage Configuration', subtitle: 'Hero content, alert ticker & metric cards' }
    }
    return { title: 'Admin Command Center', subtitle: 'System analytics, real-time sync & operations' }
  }, [location.pathname])

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#080808] text-[#F8F7F3] flex flex-row font-sans antialiased">
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* ─── Desktop Sidebar ────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 h-screen bg-[#0C0D0E] border-r border-white/[0.08] transition-all duration-300 ease-in-out z-30 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className={`p-4 ${isCollapsed ? 'px-3' : 'px-5'} space-y-6 overflow-y-auto`}>
          {/* Brand & Toggle Bar */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'} pt-2`}>
            <Link
              to="/"
              className={`flex items-center gap-3 group ${isCollapsed ? 'justify-center' : ''}`}
              title="CLUSTER Society"
            >
              <div className="w-10 h-10 rounded-xl bg-black border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(198,255,77,0.15)] group-hover:border-cluster-acid/50 transition-all">
                <ClusterMark className="w-6 h-6" sparkColor="#C6FF4D" markColor="#F8F8F5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-display font-bold text-sm text-white tracking-wider flex items-center gap-1.5 truncate">
                    CLUSTER
                    <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid animate-pulse" />
                  </span>
                  <span className="text-[9px] font-mono text-cluster-acid uppercase tracking-widest font-semibold truncate">
                    CMS CONSOLE
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse/Expand toggle */}
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-[#8E8E88] hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-colors cursor-pointer"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-4 h-4 text-cluster-acid" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Section Separator */}
          <div className="h-px bg-white/[0.06]" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'bg-cluster-acid/[0.12] text-white border border-cluster-acid/25 shadow-[0_0_15px_rgba(198,255,77,0.10)]'
                        : 'text-[#9E9E98] hover:text-[#F8F7F3] hover:bg-white/[0.05] border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Left vertical active bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-cluster-acid rounded-r shadow-[0_0_8px_rgba(198,255,77,0.8)]" />
                      )}

                      <div className="relative shrink-0 flex items-center justify-center">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-cluster-acid' : 'text-gray-400 group-hover:text-white'
                          }`}
                        />
                        {/* Dot indicator when collapsed and pending badge > 0 */}
                        {isCollapsed && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cluster-acid ring-2 ring-[#0C0D0E]" />
                        )}
                      </div>

                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.name}</span>
                          {item.badge > 0 && (
                            <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cluster-acid/15 text-cluster-acid border border-cluster-acid/30 tracking-tight">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className={`p-4 ${isCollapsed ? 'px-3' : 'px-5'} border-t border-white/[0.08] space-y-2 bg-[#090A0C]`}>
          {/* Quick Command Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title="Command Palette (Ctrl+K)"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            } rounded-xl bg-black/60 hover:bg-black border border-white/10 hover:border-cluster-acid/40 text-xs font-mono text-[#8E8E88] hover:text-white transition-all cursor-pointer group`}
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-500 group-hover:text-cluster-acid transition-colors" />
              {!isCollapsed && <span>Quick Search</span>}
            </span>
            {!isCollapsed && (
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-400 font-mono">
                ⌘K
              </kbd>
            )}
          </button>

          {/* Live Website Link */}
          <Link
            to="/"
            target="_blank"
            title="Open Live Public Site"
            className={`flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            } rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs font-mono text-[#9E9E98] hover:text-cluster-acid transition-colors`}
          >
            {!isCollapsed && <span>Live Website</span>}
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title="Sign Out of Admin Console"
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'
            } rounded-lg text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content Column ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 shrink-0 bg-[#0C0D0E]/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Section Breadcrumb Header */}
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-display font-bold text-white tracking-wide truncate">
                {currentSection.title}
              </h1>
              <p className="text-[11px] font-mono text-[#8E8E88] hidden sm:block truncate">
                {currentSection.subtitle}
              </p>
            </div>
          </div>

          {/* Center Search / Command Trigger Bar (Desktop) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 hover:bg-black border border-white/10 hover:border-cluster-acid/50 text-xs font-mono text-[#8E8E88] hover:text-white transition-all cursor-pointer group max-w-sm w-full mx-4"
          >
            <Search className="w-3.5 h-3.5 text-gray-500 group-hover:text-cluster-acid transition-colors shrink-0" />
            <span className="truncate">Search commands, events, candidates...</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-400 font-mono shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Right User & Status Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-semibold text-white truncate max-w-[180px]">
                {auth?.email || 'admin@cluster.society'}
              </div>
              <div className="text-[10px] font-mono text-cluster-acid flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid animate-pulse" />
                <span>Supabase Live</span>
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center font-bold text-xs font-mono shadow-[0_0_15px_rgba(198,255,77,0.15)]">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 overscroll-contain focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* ─── Mobile Sidebar Drawer ─────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Slide-over drawer */}
          <div className="relative w-72 max-w-[85vw] bg-[#0C0D0E] border-r border-white/10 flex flex-col justify-between p-6 z-10 shadow-2xl animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black border border-white/10 p-1 flex items-center justify-center">
                    <ClusterMark className="w-5 h-5" sparkColor="#C6FF4D" markColor="#F8F8F5" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-white tracking-wide block">
                      CLUSTER
                    </span>
                    <span className="text-[9px] font-mono text-cluster-acid uppercase tracking-widest font-semibold block">
                      CMS CONSOLE
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-px bg-white/[0.08]" />

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                          isActive
                            ? 'bg-cluster-acid/[0.12] text-white border border-cluster-acid/30 shadow-[0_0_15px_rgba(198,255,77,0.15)]'
                            : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-cluster-acid' : 'text-gray-400'}`} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cluster-acid/20 text-cluster-acid border border-cluster-acid/30">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <button
                onClick={() => {
                  setSidebarOpen(false)
                  setCommandPaletteOpen(true)
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-gray-300"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-cluster-acid" />
                  <span>Command Palette</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-400">⌘K</kbd>
              </button>

              <Link
                to="/"
                target="_blank"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-gray-400 hover:text-cluster-acid transition-colors"
              >
                <span>Live Public Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

