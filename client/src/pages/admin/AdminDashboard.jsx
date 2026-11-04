import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Users,
  UserCheck,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Clock,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Layers,
  ChevronRight,
  Sparkles,
  PieChart as PieChartIcon,
  Activity,
  FileSpreadsheet,
} from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'

// Domain palette tokens for accessible, high-contrast SVG visualization
const DOMAIN_COLORS = [
  '#C6FF4D', // Acid Lime
  '#38BDF8', // Sky
  '#A78BFA', // Purple
  '#F472B6', // Pink
  '#FBBF24', // Amber
  '#34D399', // Emerald
]

export default function AdminDashboard() {
  const [data, setData] = useState({
    events: clusterDataService.getEvents(),
    spotlight: clusterDataService.getSpotlightEvent(),
    team: clusterDataService.getTeamMembers(),
    applications: clusterDataService.getApplications(),
    analytics: clusterDataService.getAnalytics(),
    auditLog: clusterDataService.getAuditLog(),
  })

  const [activeSegment, setActiveSegment] = useState(null)
  const [notification, setNotification] = useState(null)
  const fileInputRef = useRef(null)

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const refreshData = () => {
    setData({
      events: clusterDataService.getEvents(),
      spotlight: clusterDataService.getSpotlightEvent(),
      team: clusterDataService.getTeamMembers(),
      applications: clusterDataService.getApplications(),
      analytics: clusterDataService.getAnalytics(),
      auditLog: clusterDataService.getAuditLog(),
    })
  }

  useEffect(() => {
    window.addEventListener('cluster_events_updated', refreshData)
    window.addEventListener('cluster_spotlight_updated', refreshData)
    window.addEventListener('cluster_team_updated', refreshData)
    window.addEventListener('cluster_applications_updated', refreshData)
    window.addEventListener('cluster_homepage_updated', refreshData)
    window.addEventListener('cluster_audit_updated', refreshData)

    return () => {
      window.removeEventListener('cluster_events_updated', refreshData)
      window.removeEventListener('cluster_spotlight_updated', refreshData)
      window.removeEventListener('cluster_team_updated', refreshData)
      window.removeEventListener('cluster_applications_updated', refreshData)
      window.removeEventListener('cluster_homepage_updated', refreshData)
      window.removeEventListener('cluster_audit_updated', refreshData)
    }
  }, [])

  const { analytics, spotlight, events, applications, team, auditLog } = data
  const pendingCount = analytics.statusCounts.Pending || 0

  // SVG Donut Chart Math calculation
  const donutData = useMemo(() => {
    const total = applications.length || 1
    let accumulatedAngle = 0
    const radius = 64
    const circumference = 2 * Math.PI * radius

    return analytics.domainStats.map((item, index) => {
      const sliceAngle = (item.count / total) * 360
      const strokeDash = (item.count / total) * circumference
      const strokeOffset = -((accumulatedAngle / 360) * circumference)
      const color = DOMAIN_COLORS[index % DOMAIN_COLORS.length]
      accumulatedAngle += sliceAngle

      return {
        ...item,
        color,
        strokeDash,
        strokeOffset,
        circumference,
      }
    })
  }, [applications.length, analytics.domainStats])

  const handleBackup = () => {
    clusterDataService.exportBackupJSON()
    showNotification('System database snapshot downloaded.')
  }

  const handleRestoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        const result = clusterDataService.importBackupJSON(content)
        if (result.success) {
          showNotification('Database backup restored successfully.')
        } else {
          showNotification(`Restore failed: ${result.error}`)
        }
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#0F1012] border border-cluster-acid/50 text-[#F8F7F3] text-xs font-mono flex items-center gap-2.5 shadow-2xl animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-cluster-acid animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hidden file input for restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="text-[11px] font-mono tracking-widest text-cluster-acid uppercase font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-cluster-acid" />
            <span>OPERATIONAL INTELLIGENCE & CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[#F8F7F3] mt-1">
            CLUSTER Society Command
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E88] font-sans mt-0.5">
            Real-time telemetry across recruitment pipelines, events spotlight, leadership roster, and public site copy.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/events"
            className="btn-cluster-primary px-3.5 py-2 text-xs flex items-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Event</span>
          </Link>
          <Link
            to="/admin/applications"
            className="btn-cluster-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <UserCheck className="w-3.5 h-3.5 text-cluster-acid" />
            <span>Review Applications {pendingCount > 0 && `(${pendingCount})`}</span>
          </Link>
          <button
            onClick={() => clusterDataService.exportApplicationsCSV()}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#D4D4CD] hover:text-white flex items-center gap-1.5 active:scale-[0.98] transition-colors"
            title="Download full candidate roster as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#C6FF4D]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleBackup}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#8E8E88] hover:text-white flex items-center gap-1.5 active:scale-[0.98] transition-colors"
            title="Download full system JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backup</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Applicants */}
        <div className="rounded-2xl p-5 bg-[#0F1012] border border-cluster-acid/30 hover:border-cluster-acid/60 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8E8E88] uppercase tracking-wider">Candidate Pool</span>
            <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-cluster-acid">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold font-mono text-cluster-acid tabular-nums">
            {applications.length}
          </div>
          <div className="text-[11px] font-mono text-[#8E8E88] flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${pendingCount > 0 ? 'bg-amber-400' : 'bg-cluster-acid'}`} />
            <span>{pendingCount} awaiting initial review</span>
          </div>
        </div>

        {/* Metric 2: Acceptance Rate */}
        <div className="rounded-2xl p-5 bg-[#0F1012] border border-white/10 hover:border-white/20 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8E8E88] uppercase tracking-wider">Acceptance Ratio</span>
            <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[#38BDF8]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold font-mono text-[#F8F7F3] tabular-nums">
            {analytics.acceptanceRate}%
          </div>
          <div className="w-full bg-[#18191C] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cluster-acid h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(analytics.acceptanceRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Published Events */}
        <div className="rounded-2xl p-5 bg-[#0F1012] border border-white/10 hover:border-white/20 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8E8E88] uppercase tracking-wider">Events Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-cluster-acid">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold font-mono text-[#F8F7F3] tabular-nums">
            {events.length}
          </div>
          <div className="text-[11px] font-mono text-[#8E8E88] truncate flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid shrink-0" />
            <span className="truncate">
              {spotlight ? `Spotlight: ${spotlight.title.slice(0, 20)}...` : 'No active spotlight'}
            </span>
          </div>
        </div>

        {/* Metric 4: Executive Board */}
        <div className="rounded-2xl p-5 bg-[#0F1012] border border-white/10 hover:border-white/20 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8E8E88] uppercase tracking-wider">Executive Roster</span>
            <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[#A78BFA]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold font-mono text-[#F8F7F3] tabular-nums">
            {team.length}
          </div>
          <div className="text-[11px] font-mono text-[#8E8E88] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid" />
            <span>Active Student Officers</span>
          </div>
        </div>
      </div>

      {/* Visual Intelligence Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Domain Breakdown (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-cluster-acid uppercase tracking-widest font-semibold flex items-center gap-2">
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>APPLICANT DOMAIN DISTRIBUTION</span>
              </div>
              <h2 className="text-lg font-display font-bold text-[#F8F7F3]">
                Circle Interest Breakdown
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8E8E88]">
              {applications.length} submissions logged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* SVG Donut */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
              <svg
                viewBox="0 0 160 160"
                className="w-40 h-40 transform -rotate-90"
                role="img"
                aria-label="Applicant domain distribution chart"
              >
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="#18191C"
                  strokeWidth="18"
                />
                {/* Donut Segments */}
                {donutData.map((slice, i) => (
                  <circle
                    key={i}
                    cx="80"
                    cy="80"
                    r="64"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={activeSegment === slice.domain ? '22' : '18'}
                    strokeDasharray={`${slice.strokeDash} ${slice.circumference}`}
                    strokeDashoffset={slice.strokeOffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setActiveSegment(slice.domain)}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                ))}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-display font-black text-white font-mono tabular-nums">
                  {applications.length}
                </span>
                <span className="text-[9px] font-mono text-[#8E8E88] uppercase tracking-wider">
                  Total Apps
                </span>
              </div>
            </div>

            {/* Domain Legend & Progress Bars */}
            <div className="sm:col-span-7 space-y-3">
              {donutData.map((item, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveSegment(item.domain)}
                  onMouseLeave={() => setActiveSegment(null)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    activeSegment === item.domain ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-sans mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#D4D4CD] truncate font-medium">{item.domain}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                      <span className="text-[#8E8E88]">{item.count}</span>
                      <span className="text-white font-bold">{item.percent}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#18191C] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Pipeline & Event Distribution (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recruitment Funnel Card */}
          <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="text-[10px] font-mono text-cluster-acid uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>RECRUITMENT PIPELINE</span>
              </div>
              <Link
                to="/admin/applications"
                className="text-[11px] font-mono text-cluster-acid hover:text-white flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { status: 'Pending', count: analytics.statusCounts.Pending || 0, color: 'bg-amber-400', text: 'text-amber-400' },
                { status: 'Under Review', count: analytics.statusCounts['Under Review'] || 0, color: 'bg-sky-400', text: 'text-sky-400' },
                { status: 'Accepted', count: analytics.statusCounts.Accepted || 0, color: 'bg-cluster-acid', text: 'text-cluster-acid' },
                { status: 'Waitlisted', count: analytics.statusCounts.Waitlisted || 0, color: 'bg-purple-400', text: 'text-purple-400' },
                { status: 'Rejected', count: analytics.statusCounts.Rejected || 0, color: 'bg-red-400', text: 'text-red-400' },
              ].map((stage, idx) => {
                const total = applications.length || 1
                const percent = Math.round((stage.count / total) * 100)
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#B5B5AE]">{stage.status}</span>
                      <span className={`font-bold tabular-nums ${stage.text}`}>
                        {stage.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#18191C] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Event Categories Card */}
          <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="text-[10px] font-mono text-cluster-acid uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>EVENTS SCHEDULE BY FORMAT</span>
              </div>
              <Link
                to="/admin/events"
                className="text-[11px] font-mono text-cluster-acid hover:text-white flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(analytics.eventTypes).map(([type, count]) => (
                <div
                  key={type}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1"
                >
                  <span className="text-[10px] font-mono text-[#8E8E88] uppercase tracking-wider block">
                    {type}
                  </span>
                  <div className="text-xl font-display font-bold font-mono text-white tabular-nums">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modules & Audit Trail Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Modules Quick Nav (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-[#F8F7F3] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cluster-acid" />
              <span>Society Management Modules</span>
            </h2>
            <button
              onClick={handleRestoreClick}
              className="text-xs font-mono text-[#8E8E88] hover:text-cluster-acid flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Snapshot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/events"
              className="rounded-2xl p-5 bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/50 space-y-3 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cluster-acid transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  Events & Spotlight
                </h3>
                <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                  Schedule hackathons, manage registrations, and promote live spotlight event to public countdown.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/applications"
              className="rounded-2xl p-5 bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/50 space-y-3 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cluster-acid transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  Recruitment Pipeline
                </h3>
                <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                  Review applicant dossiers, triage candidates across pipeline stages, and export full CSV rosters.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/homepage"
              className="rounded-2xl p-5 bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/50 space-y-3 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cluster-acid transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  Homepage & Alerts
                </h3>
                <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                  Live announcement ticker, hero subtitle copy, dynamic metric stat counters, and instant preview.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/team"
              className="rounded-2xl p-5 bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/50 space-y-3 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-cluster-acid flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-cluster-acid transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  Executive Board
                </h3>
                <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                  Manage officer bios, graduation years, roles, social links, and public leadership page roster.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Live Audit Trail (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-base font-display font-bold text-[#F8F7F3] flex items-center gap-2">
                <Activity className="w-4 h-4 text-cluster-acid" />
                <span>Audit & Activity Stream</span>
              </h2>
              <span className="text-[10px] font-mono text-cluster-acid">● Live</span>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {auditLog.map((log) => {
                const date = new Date(log.timestamp)
                const timeString = isNaN(date.getTime())
                  ? 'Recent'
                  : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cluster-acid font-semibold uppercase">
                        {log.action}
                      </span>
                      <span className="text-[#8E8E88]">{timeString}</span>
                    </div>
                    <p className="text-xs text-[#D4D4CD] font-sans leading-relaxed">
                      {log.summary}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#8E8E88]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cluster-acid" />
              <span>State: Synchronized</span>
            </span>
            <span>Local Vault Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
