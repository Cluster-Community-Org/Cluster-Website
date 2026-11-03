import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, LogOut, ExternalLink, Menu, X, ShieldAlert } from 'lucide-react'
import { ClusterMark } from '../components/ui/ClusterLogo.jsx'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const auth = JSON.parse(localStorage.getItem('cluster_admin_auth') || 'null')

  useEffect(() => {
    // If not logged in, redirect to login
    if (!auth) {
      navigate('/admin/login')
    }
  }, [auth, navigate])

  const handleLogout = () => {
    localStorage.removeItem('cluster_admin_auth')
    navigate('/admin/login')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Events CMS', href: '/admin/events', icon: Calendar },
    { name: 'Team CMS', href: '/admin/team', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-obsidian-900 border-r border-white/10 flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-black border border-white/10 p-1 flex items-center justify-center shrink-0 shadow-cluster-glow group-hover:border-cluster-acid transition-all">
              <ClusterMark className="w-7 h-7" sparkColor="#C6FF4D" markColor="#F8F8F5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-white tracking-wider">
                CLUSTER
              </span>
              <span className="text-[9px] font-mono text-cluster-acid uppercase tracking-widest font-semibold">
                CMS DASHBOARD
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'nav-pill-active'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-obsidian-950 border border-white/5 text-xs font-mono text-gray-300 hover:text-cluster-green transition-colors"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-obsidian-900 border-b border-white/10 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-obsidian-850 text-gray-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-gray-400 hidden sm:inline">
              Authenticated Role: <span className="text-cluster-acid font-bold uppercase">{auth?.role || 'Admin'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-semibold text-white">{auth?.email || 'admin@cluster.society'}</div>
              <div className="text-[10px] font-mono text-cluster-acid">Active Session</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center font-bold text-xs font-mono">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-obsidian-900 border-r border-white/10 flex flex-col justify-between p-6 z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClusterMark className="w-7 h-7" sparkColor="#C6FF4D" markColor="#F8F8F5" />
                  <span className="font-display font-bold text-sm text-white">CLUSTER CMS</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                          isActive ? 'nav-pill-active' : 'text-gray-300 hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-400 hover:bg-red-500/10 rounded-lg"
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

