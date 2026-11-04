import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Calendar,
  Users,
  UserCheck,
  Monitor,
  LayoutDashboard,
  FileSpreadsheet,
  Download,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Command,
} from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  // Reset and focus when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Data sources
  const events = useMemo(() => clusterDataService.getEvents(), [isOpen])
  const team = useMemo(() => clusterDataService.getTeamMembers(), [isOpen])
  const applications = useMemo(() => clusterDataService.getApplications(), [isOpen])

  // Static Navigation and Action items
  const baseActions = useMemo(() => [
    {
      id: 'nav-dash',
      title: 'Dashboard Overview',
      subtitle: 'Analytics, KPI ribbons, and live audit trail',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => navigate('/admin/dashboard'),
    },
    {
      id: 'nav-events',
      title: 'Events & Spotlight CMS',
      subtitle: 'Schedule hackathons and manage live countdown',
      category: 'Navigation',
      icon: Calendar,
      action: () => navigate('/admin/events'),
    },
    {
      id: 'nav-apps',
      title: 'Recruitment & Applications',
      subtitle: 'Review student candidates and advance stages',
      category: 'Navigation',
      icon: UserCheck,
      action: () => navigate('/admin/applications'),
    },
    {
      id: 'nav-home',
      title: 'Homepage & Alerts CMS',
      subtitle: 'Configure top ticker banner, copy, and counters',
      category: 'Navigation',
      icon: Monitor,
      action: () => navigate('/admin/homepage'),
    },
    {
      id: 'nav-team',
      title: 'Executive Board Roster',
      subtitle: 'Manage officer roles, bios, and social links',
      category: 'Navigation',
      icon: Users,
      action: () => navigate('/admin/team'),
    },
    {
      id: 'action-export-csv',
      title: 'Export Applications CSV',
      subtitle: 'Download complete candidate spreadsheet',
      category: 'Quick Actions',
      icon: FileSpreadsheet,
      action: () => clusterDataService.exportApplicationsCSV(),
    },
    {
      id: 'action-backup',
      title: 'Download JSON Database Snapshot',
      subtitle: 'Export full society vault backup file',
      category: 'Quick Actions',
      icon: Download,
      action: () => clusterDataService.exportBackupJSON(),
    },
    {
      id: 'nav-public',
      title: 'View Public Website',
      subtitle: 'Open live homepage in a new tab',
      category: 'Navigation',
      icon: ExternalLink,
      action: () => window.open('/', '_blank'),
    },
  ], [navigate])

  // Filtered results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return baseActions

    const filtered = []

    // 1. Matches in base actions
    baseActions.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      ) {
        filtered.push(item)
      }
    })

    // 2. Matches in Events
    events.forEach((ev) => {
      if (
        ev.title.toLowerCase().includes(q) ||
        (ev.summary && ev.summary.toLowerCase().includes(q)) ||
        (ev.location && ev.location.toLowerCase().includes(q))
      ) {
        filtered.push({
          id: `event-${ev.id}`,
          title: ev.title,
          subtitle: `Event // ${ev.date} • ${ev.type || 'session'}`,
          category: 'Events',
          icon: Calendar,
          action: () => navigate('/admin/events'),
        })
      }
    })

    // 3. Matches in Applications
    applications.forEach((app) => {
      if (
        (app.fullName && app.fullName.toLowerCase().includes(q)) ||
        (app.email && app.email.toLowerCase().includes(q)) ||
        (app.domain && app.domain.toLowerCase().includes(q)) ||
        (app.rollNumber && app.rollNumber.toLowerCase().includes(q))
      ) {
        filtered.push({
          id: `app-${app.id}`,
          title: app.fullName,
          subtitle: `Applicant // ${app.domain} • ${app.status}`,
          category: 'Applications',
          icon: UserCheck,
          action: () => navigate('/admin/applications'),
        })
      }
    })

    // 4. Matches in Team Members
    team.forEach((m) => {
      if (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
      ) {
        filtered.push({
          id: `team-${m.id}`,
          title: m.name,
          subtitle: `Officer // ${m.role} (${m.graduationYear})`,
          category: 'Team',
          icon: Users,
          action: () => navigate('/admin/team'),
        })
      }
    })

    return filtered
  }, [query, baseActions, events, applications, team, navigate])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          results[selectedIndex].action()
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D0E10] border border-white/[0.12] shadow-2xl overflow-hidden text-[#F8F7F3] flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3 bg-black/40">
          <Search className="w-5 h-5 text-cluster-acid shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, page, event, officer, or applicant..."
            className="w-full bg-transparent text-sm font-mono text-white placeholder-[#8E8E88] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#8E8E88] space-y-1">
              <p>No results found for "{query}"</p>
              <p className="text-[11px] text-gray-500">Try searching for "events", "applications", or candidate names.</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex

              return (
                <div
                  key={item.id}
                  data-active={isSelected}
                  onClick={() => {
                    item.action()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white/10 border border-cluster-acid/40 text-white'
                      : 'hover:bg-white/5 border border-transparent text-[#D4D4CD]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-cluster-acid/20 border-cluster-acid text-cluster-acid'
                          : 'bg-black/60 border-white/10 text-[#8E8E88]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-display font-bold text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-[#8E8E88] truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-cluster-acid" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8E8E88]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-gray-300">↑↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-gray-300">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span>CLUSTER Society Palette</span>
        </div>
      </div>
    </div>
  )
}
