import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Github,
  Linkedin,
  Eye,
  Trash2,
  X,
  Mail,
  Hash,
  BookOpen,
  FileSpreadsheet,
  Copy,
  Check,
  Send,
  HelpCircle,
  PauseCircle,
  PlayCircle,
  Lock,
  Unlock,
  Code,
  RefreshCw,
  Loader2,
  Sparkles,
  Layers,
} from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { getSafeUrl } from '../../lib/safeUrl.js'
import { useToast } from '../../context/ToastContext.jsx'

const STATUS_CONFIG = {
  Pending: {
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    icon: Clock,
  },
  'Under Review': {
    color: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
    icon: AlertCircle,
  },
  Accepted: {
    color: 'text-cluster-acid bg-cluster-acid/15 border-cluster-acid/40',
    icon: CheckCircle2,
  },
  Waitlisted: {
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    icon: Clock,
  },
  Rejected: {
    color: 'text-red-400 bg-red-400/10 border-red-400/30',
    icon: XCircle,
  },
}

import { CIRCLES } from '../../components/sections/CirclesSection.jsx'

const CIRCLE_CONFIG = {
  Compute: {
    color: 'bg-cluster-acid/15 text-cluster-acid border-cluster-acid/30',
    dot: 'bg-cluster-acid',
    label: 'Compute Circle',
  },
  'Applied AI': {
    color: 'bg-sky-400/15 text-sky-400 border-sky-400/30',
    dot: 'bg-sky-400',
    label: 'Applied AI Circle',
  },
  Crew: {
    color: 'bg-purple-400/15 text-purple-400 border-purple-400/30',
    dot: 'bg-purple-400',
    label: 'Crew Circle',
  },
}

const CIRCLE_FILTER_OPTIONS = [
  { label: 'All Circles & Tracks', value: 'All' },
  { label: '⚡ Compute Circle (GPUs, DGX, CUDA, LLMs)', value: 'Circle: Compute' },
  { label: '👁️ Applied AI Circle (Robotics, Vision, Omniverse)', value: 'Circle: Applied AI' },
  { label: '🚀 Crew Circle (Design, Media, Marketing, Events)', value: 'Circle: Crew' },
  ...CIRCLES.flatMap((c) => c.tracks.map(([t]) => ({ label: `${c.name} → ${t}`, value: t }))),
]

const DOMAINS = ['All Domains', ...CIRCLES.flatMap((c) => c.tracks.map(([t]) => t))]

const STATUS_TABS = ['All', 'Pending', 'Under Review', 'Accepted', 'Waitlisted', 'Rejected']

// Helper to parse comma-separated domains/tracks into a clean array
const parseDomains = (domainStr) => {
  if (!domainStr) return []
  return domainStr
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)
}

// Helper to identify which circle a track belongs to
const getCircleForTrack = (trackName) => {
  if (!trackName) return null
  const lower = trackName.toLowerCase()
  for (const circle of CIRCLES) {
    for (const [tName] of circle.tracks) {
      if (tName.toLowerCase() === lower || lower.includes(tName.toLowerCase()) || tName.toLowerCase().includes(lower)) {
        return circle.name
      }
    }
  }
  return null
}

// Helper to identify all unique circles an applicant matches
const getMatchedCircles = (domainStr) => {
  const tracks = parseDomains(domainStr)
  const circles = new Set()
  tracks.forEach((t) => {
    const c = getCircleForTrack(t)
    if (c) circles.add(c)
  })
  return Array.from(circles)
}

const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row on row 1 if sheet is empty (14 columns)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Application ID", "Full Name", "Email", "Roll Number", 
        "Course", "Branch", "Year", "Domain / Tracks", 
        "GitHub", "LinkedIn", "Projects (Built/Shipped)", "Motivation", "Status"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#C6FF4D").setFontColor("#000000");
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // ── SECURITY: OPTIONAL WEBHOOK SECRET TOKEN CHECK ──
    var configuredSecret = PropertiesService.getScriptProperties().getProperty("CLUSTER_WEBHOOK_SECRET");
    if (configuredSecret && data.secret !== configuredSecret) {
      return ContentService.createTextOutput(JSON.stringify({ result: "error", error: "Unauthorized: Invalid secret token" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Neutralize spreadsheet formula injection (=, +, -, @)
    function sanitizeCell(val) {
      var str = (val || "").toString();
      var c = str.charAt(0);
      if (c === '=' || c === '+' || c === '-' || c === '@' || c === '\\t' || c === '\\r') {
        return "'" + str;
      }
      return str;
    }

    // ── CASE 1: UPDATE STATUS OF AN EXISTING CANDIDATE ──
    if (data.action === "UPDATE_STATUS" && data.status) {
      var targetId = (data.id || data.applicationId || "").toString().trim().toLowerCase();
      var targetEmail = (data.email || "").toString().trim().toLowerCase();
      var targetRoll = (data.rollNumber || data.roll_number || "").toString().trim().toLowerCase();
      var lastRow = sheet.getLastRow();

      if (lastRow > 1) {
        var numCols = Math.min(sheet.getLastColumn(), 14);
        var range = sheet.getRange(2, 1, lastRow - 1, numCols);
        var values = range.getValues();
        var foundRow = -1;

        for (var i = 0; i < values.length; i++) {
          var rowId = (values[i][1] || "").toString().trim().toLowerCase();
          var rowEmail = (values[i][3] || values[i][2] || "").toString().trim().toLowerCase();
          var rowRoll = (values[i][4] || values[i][3] || "").toString().trim().toLowerCase();
          
          if ((targetId && rowId === targetId) || (targetEmail && rowEmail === targetEmail) || (targetRoll && rowRoll === targetRoll)) {
            foundRow = i + 2;
            break;
          }
        }

        if (foundRow > 0) {
          var statusCol = numCols >= 14 ? 14 : numCols;
          var statusCell = sheet.getRange(foundRow, statusCol);
          statusCell.setValue(sanitizeCell(data.status));
          
          if (data.status === "Accepted") {
            statusCell.setBackground("#C6FF4D").setFontColor("#000000").setFontWeight("bold");
          } else if (data.status === "Rejected") {
            statusCell.setBackground("#FFCDD2").setFontColor("#B71C1C").setFontWeight("bold");
          } else if (data.status === "Under Review") {
            statusCell.setBackground("#E1F5FE").setFontColor("#0277BD").setFontWeight("bold");
          } else if (data.status === "Waitlisted") {
            statusCell.setBackground("#EDE7F6").setFontColor("#512DA8").setFontWeight("bold");
          } else {
            statusCell.setBackground("#FFF9C4").setFontColor("#F57F17").setFontWeight("bold");
          }

          return ContentService.createTextOutput(JSON.stringify({ result: "success", action: "status_updated" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // ── CASE 2: NEW APPLICATION INSERT (14 Columns) ──
    sheet.appendRow([
      new Date(),
      sanitizeCell(data.id || data.applicationId || "app-" + Date.now()),
      sanitizeCell(data.fullName || data.full_name),
      sanitizeCell(data.email),
      sanitizeCell(data.rollNumber || data.roll_number),
      sanitizeCell(data.course),
      sanitizeCell(data.branch),
      sanitizeCell(data.year),
      sanitizeCell(data.domain),
      sanitizeCell(data.github),
      sanitizeCell(data.linkedin),
      sanitizeCell(data.projects),
      sanitizeCell(data.motivation),
      sanitizeCell(data.status || 'Pending')
    ]);

    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([new Date(), "ERROR: " + error.toString()]);
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Open your Web App URL in browser to test if it's reachable!
function doGet(e) {
  return ContentService.createTextOutput("CLUSTER Google Sheet Webhook is active and reachable!");
}`

export default function AdminApplications() {
  const { showToast } = useToast()
  const [applications, setApplications] = useState(() => clusterDataService.getApplications())
  const [search, setSearch] = useState('')
  const [selectedStatusTab, setSelectedStatusTab] = useState('All')
  const [selectedDomain, setSelectedDomain] = useState('All Domains')
  const [selectedApp, setSelectedApp] = useState(null)

  // Google Sheets Webhook Integration State
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false)
  const [sheetUrl, setSheetUrl] = useState(() => clusterDataService.getApplicationsSheetUrl())
  const [sheetUrlInput, setSheetUrlInput] = useState(() => clusterDataService.getApplicationsSheetUrl())
  const [isTestingPing, setIsTestingPing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [copiedAppId, setCopiedAppId] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedRoll, setCopiedRoll] = useState(false)
  const [copiedDossier, setCopiedDossier] = useState(false)

  // Recruitment Window State (Open vs Paused/Closed)
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(() => clusterDataService.isApplicationsOpen())
  const [isSyncing, setIsSyncing] = useState(false)

  const handleManualSync = async () => {
    setIsSyncing(true)
    const res = await clusterDataService.syncFromSupabase()
    setIsSyncing(false)
    if (res?.success) {
      const count = res.results?.applications ?? 0
      showToast(`Synced with Supabase (${count} applications retrieved)`, count > 0 ? 'success' : 'info')
    } else {
      showToast(`Supabase sync failed: ${res?.error || 'Unknown error'}`, 'error')
    }
  }

  useEffect(() => {
    // Automatically trigger fresh sync from Supabase when entering page
    clusterDataService.syncFromSupabase()

    const handleUpdate = () => {
      setApplications(clusterDataService.getApplications())
    }
    const handleConfigUpdate = () => {
      const url = clusterDataService.getApplicationsSheetUrl()
      setSheetUrl(url)
      setSheetUrlInput(url)
      setIsApplicationsOpen(clusterDataService.isApplicationsOpen())
    }
    window.addEventListener('cluster_applications_updated', handleUpdate)
    window.addEventListener('cluster_homepage_updated', handleConfigUpdate)
    return () => {
      window.removeEventListener('cluster_applications_updated', handleUpdate)
      window.removeEventListener('cluster_homepage_updated', handleConfigUpdate)
    }
  }, [])

  const handleToggleApplicationsOpen = () => {
    const next = !isApplicationsOpen
    clusterDataService.setApplicationsOpen(next)
    setIsApplicationsOpen(next)
    showToast(
      next
        ? 'Recruitment OPEN: Form is now active on /join'
        : 'Recruitment PAUSED: "Applications Closed" notice is now active on /join',
      next ? 'success' : 'info'
    )
  }

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.rollNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.course || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.branch || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.year || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.branchYear || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.domain || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.projects || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      selectedStatusTab === 'All' ? true : app.status === selectedStatusTab

    const matchesDomain = (() => {
      if (!selectedDomain || selectedDomain === 'All' || selectedDomain === 'All Domains') return true
      if (selectedDomain === 'Circle: Compute') {
        return getMatchedCircles(app.domain).includes('Compute')
      }
      if (selectedDomain === 'Circle: Applied AI') {
        return getMatchedCircles(app.domain).includes('Applied AI')
      }
      if (selectedDomain === 'Circle: Crew') {
        return getMatchedCircles(app.domain).includes('Crew')
      }
      return (app.domain || '').toLowerCase().includes(selectedDomain.toLowerCase())
    })()

    return matchesSearch && matchesStatus && matchesDomain
  })

  // Metrics
  const totalCount = applications.length
  const pendingCount = applications.filter((a) => a.status === 'Pending').length
  const underReviewCount = applications.filter((a) => a.status === 'Under Review').length
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length

  const handleStatusChange = (id, newStatus) => {
    const updated = clusterDataService.updateApplicationStatus(id, newStatus)
    setApplications(updated)
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, status: newStatus })
    }
    showToast(`Status updated to "${newStatus}"`)
  }

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete the application from ${name || 'this candidate'}?`)) {
      const updated = clusterDataService.deleteApplication(id)
      setApplications(updated)
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null)
      }
      showToast(`Application deleted`, 'info')
    }
  }

  const handleExportCSV = () => {
    clusterDataService.exportApplicationsCSV()
    showToast(`Applications exported to CSV`)
  }

  const handleSaveSheetUrl = () => {
    clusterDataService.updateApplicationsSheetUrl(sheetUrlInput)
    setSheetUrl(sheetUrlInput.trim())
    showToast(sheetUrlInput.trim() ? 'Google Sheets Webhook saved successfully!' : 'Webhook URL cleared')
    setIsSheetModalOpen(false)
  }

  const handleTestPing = async () => {
    setIsTestingPing(true)
    const res = await clusterDataService.testApplicationsSheetUrl(sheetUrlInput)
    setIsTestingPing(false)
    showToast(res.message, res.success ? 'success' : 'error')
  }

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE)
    setIsCopied(true)
    showToast('Google Apps Script code copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2500)
  }

  const handleCopyAppId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedAppId(true)
    setTimeout(() => setCopiedAppId(false), 2000)
    showToast('Application ID copied to clipboard')
  }

  const handleCopyEmail = (email) => {
    if (!email) return
    navigator.clipboard.writeText(email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
    showToast('Candidate email copied')
  }

  const handleCopyRoll = (roll) => {
    if (!roll) return
    navigator.clipboard.writeText(roll)
    setCopiedRoll(true)
    setTimeout(() => setCopiedRoll(false), 2000)
    showToast('Roll number copied')
  }

  const handleCopyDossier = (app) => {
    if (!app) return
    const markdown = `# CANDIDATE DOSSIER // CLUSTER
- **Application ID:** \`${app.id || 'N/A'}\`
- **Candidate Name:** ${app.fullName || 'N/A'}
- **Current Status:** ${app.status || 'Pending'}
- **Submitted:** ${app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'N/A'}
- **Email:** ${app.email || 'N/A'}
- **Roll Number:** ${app.rollNumber || 'N/A'}
- **Course / Branch / Year:** ${app.course || 'B.Tech'} · ${app.branch || 'CSE'} · ${app.year || '2nd Year'}
- **Domain:** ${app.domain || 'N/A'}
- **GitHub:** ${app.github || 'N/A'}
- **LinkedIn:** ${app.linkedin || 'N/A'}

## Projects & What They've Built
${app.projects || 'None specified'}

## Motivation Statement
${app.motivation || 'None specified'}
`
    navigator.clipboard.writeText(markdown)
    setCopiedDossier(true)
    setTimeout(() => setCopiedDossier(false), 2000)
    showToast('Full candidate dossier copied (Markdown)')
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedApp) setSelectedApp(null)
        if (isSheetModalOpen) setIsSheetModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedApp, isSheetModalOpen])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-cluster-acid" />
            <span>RECRUITMENT & INDUCTION PIPELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Membership Applications
          </h1>
          <p className="text-xs text-[#8E8E88] font-sans mt-0.5">
            Review incoming student applications, advance candidates through recruitment stages, and export data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Manual Supabase Sync */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="btn-cluster-secondary px-3.5 py-2.5 text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-50"
            title="Fetch latest applications directly from Supabase"
          >
            <RefreshCw className={`w-4 h-4 text-cluster-acid ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
          </button>

          {/* Master Recruitment Status Toggle */}
          <button
            onClick={handleToggleApplicationsOpen}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${isApplicationsOpen
                ? 'bg-cluster-acid/15 border-cluster-acid/50 text-cluster-acid hover:bg-cluster-acid/25'
                : 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25'
              }`}
            title="Toggle whether public visitors can submit applications on /join"
          >
            {isApplicationsOpen ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cluster-acid animate-pulse" />
                <Unlock className="w-4 h-4 text-cluster-acid" />
                <span>Applications Open</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <Lock className="w-4 h-4 text-red-400" />
                <span>Applications Closed</span>
              </>
            )}
          </button>

          {/* Public Join Page Link */}
          <a
            href={typeof window !== 'undefined' ? `${window.location.origin}/join` : '/join'}
            target="_blank"
            rel="noreferrer"
            className="btn-cluster-secondary px-3.5 py-2.5 text-xs font-mono font-bold flex items-center gap-1.5"
            title="Open dedicated public join page"
          >
            <ExternalLink className="w-4 h-4 text-cluster-acid" />
            <span>View Join Page</span>
          </a>

          {/* Google Sheets Sync Trigger */}
          <button
            onClick={() => {
              setSheetUrlInput(sheetUrl)
              setIsSheetModalOpen(true)
            }}
            className="btn-cluster-secondary px-3.5 py-2.5 text-xs font-mono font-bold flex items-center gap-2 group cursor-pointer"
            title="Configure or edit the Google Sheet webhook link for yearly recruitment"
          >
            <span className={`w-2 h-2 rounded-full ${sheetUrl ? 'bg-cluster-acid shadow-[0_0_8px_rgba(198,255,77,0.8)]' : 'bg-gray-500'}`} />
            <FileSpreadsheet className="w-4 h-4 text-cluster-acid group-hover:scale-110 transition-transform" />
            <span>{sheetUrl ? 'Sheet Sync Active' : 'Connect Google Sheet'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-cluster-secondary px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cluster-acid" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Paused Recruitment Alert Banner */}
      {!isApplicationsOpen && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white block font-sans text-sm">Recruitment is Currently Closed / Paused</strong>
              <span>Public visitors navigating to <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">/join</code> or opening the join modal see the &quot;Applications Closed&quot; notice. No new submissions can be made.</span>
            </div>
          </div>
          <button
            onClick={handleToggleApplicationsOpen}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold shrink-0 hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Re-Open Applications
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono">
        <div className="p-4 rounded-2xl bg-[#0F1012] border border-white/[0.08]">
          <div className="text-xs text-[#8E8E88] uppercase tracking-wider">Total Received</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{totalCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F1012] border border-amber-400/20">
          <div className="text-xs text-amber-400 uppercase tracking-wider">Pending Action</div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">{pendingCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F1012] border border-sky-400/20">
          <div className="text-xs text-sky-400 uppercase tracking-wider">Under Review</div>
          <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-1">{underReviewCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0F1012] border border-cluster-acid/30">
          <div className="text-xs text-cluster-acid uppercase tracking-wider">Accepted Builders</div>
          <div className="text-2xl sm:text-3xl font-bold text-cluster-acid mt-1">{acceptedCount}</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0C0D0E] border border-white/[0.08]">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === 'All'
                ? applications.length
                : applications.filter((a) => a.status === tab).length
            return (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${selectedStatusTab === tab
                    ? 'bg-cluster-acid text-black font-bold'
                    : 'text-[#8E8E88] hover:text-white hover:bg-white/5'
                  }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedStatusTab === tab ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                    }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Domain Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll number, or domain..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1012] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cluster-acid shrink-0 hidden sm:block" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#0F1012] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
            >
              {CIRCLE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#141517] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl bg-[#0F1012] border border-white/[0.08] overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-600 mx-auto" />
            <div className="text-white font-display font-bold">No applications match your filter</div>
            <p className="text-xs text-gray-500 font-sans">
              Try adjusting your search query, status tab, or domain filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0C0D0E] font-mono text-[11px] text-[#8E8E88] uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Domain / Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredApps.map((app) => {
                  const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending
                  const StatusIcon = statusConf.icon
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Candidate Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-cluster-acid transition-colors">
                            {app.fullName}
                          </span>
                          {app.projects && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cluster-acid/15 border border-cluster-acid/40 text-cluster-acid"
                              title={app.projects}
                            >
                              <Code className="w-2.5 h-2.5" />
                              <span>Shipped</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8E8E88] font-mono mt-0.5">
                          {app.email} · {app.rollNumber}
                        </div>
                      </td>

                      {/* Domain & Academic Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {getMatchedCircles(app.domain).map((cName) => {
                            const conf = CIRCLE_CONFIG[cName] || CIRCLE_CONFIG.Compute
                            return (
                              <span
                                key={cName}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${conf.color}`}
                                title={`Matched Circle: ${cName}`}
                              >
                                <span className={`w-1 h-1 rounded-full ${conf.dot}`} />
                                <span>{cName}</span>
                              </span>
                            )
                          })}
                          {parseDomains(app.domain).map((track, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#D4D4CD] bg-white/[0.04] border border-white/[0.08]"
                            >
                              {track}
                            </span>
                          ))}
                          {parseDomains(app.domain).length === 0 && (
                            <span className="text-[#8E8E88] font-mono text-xs">{app.domain || 'N/A'}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8E8E88] font-mono mt-1">
                          {app.course && app.branch
                            ? `${app.course} · ${app.branch} (${app.year || ''})`
                            : app.branchYear || 'N/A'}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${statusConf.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{app.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#8E8E88]">
                        {new Date(app.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Stage Status Selector */}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="bg-[#141517] text-[#D4D4CD] border border-white/[0.08] text-[10px] font-mono px-2 py-1 rounded-md focus:border-cluster-acid focus:outline-none"
                            aria-label="Change candidate status"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Waitlisted">Waitlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          {/* View Detail Button */}
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8E8E88] hover:text-white transition-colors"
                            title="View Full Profile & Motivation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(app.id, app.fullName)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#8E8E88] hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {selectedApp && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-[#0C0D0E] border border-white/[0.12] shadow-2xl text-[#F8F7F3]">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 pb-4 border-b border-white/[0.08] bg-[#0E0F12]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-cluster-acid uppercase bg-cluster-acid/10 px-2.5 py-0.5 rounded-full border border-cluster-acid/20">
                      CANDIDATE DOSSIER
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${STATUS_CONFIG[selectedApp.status]?.color || 'text-gray-400 bg-white/5 border-white/10'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {selectedApp.status}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight mt-2">
                    {selectedApp.fullName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E88] pt-0.5">
                    <span>
                      Submitted {new Date(selectedApp.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedApp.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyDossier(selectedApp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] text-xs font-mono text-[#D4D4CD] hover:text-white transition-colors"
                    title="Copy Full Dossier (Markdown)"
                  >
                    {copiedDossier ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cluster-acid" />
                        <span className="text-cluster-acid">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Copy Dossier</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${selectedApp.email}?subject=Regarding%20your%20CLUSTER%20Application%20(${encodeURIComponent(selectedApp.fullName || '')})`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] text-xs font-mono text-[#D4D4CD] hover:text-white transition-colors"
                    title="Send Email to Candidate"
                  >
                    <Mail className="w-3.5 h-3.5 text-cluster-acid" />
                    <span className="hidden sm:inline">Email</span>
                  </a>

                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-1"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Application ID Card */}
              <div className="mt-4 p-3 rounded-2xl bg-[#141518] border border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-cluster-acid/10 border border-cluster-acid/20 flex items-center justify-center shrink-0">
                    <Hash className="w-3.5 h-3.5 text-cluster-acid" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E88]">
                      Application ID (Google Sheet &amp; Supabase Ref)
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-bold text-cluster-acid truncate select-all">
                      {selectedApp.id}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyAppId(selectedApp.id)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cluster-acid/15 border border-white/10 hover:border-cluster-acid/30 text-xs font-mono text-white transition-all"
                  title="Copy Application ID"
                >
                  {copiedAppId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cluster-acid" />
                      <span className="text-cluster-acid font-bold">Copied ID</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Top Section: Responsive 2 Columns (Left: Candidate Profile | Right: Selected Domains Full View) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Left Column: Academic & Contact Profile (7 columns) */}
                <div className="md:col-span-7 flex flex-col space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#8E8E88] font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cluster-acid" />
                    <span>Candidate &amp; Academic Profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Email */}
                    <div className="p-3 rounded-2xl bg-[#121316] border border-white/[0.06] space-y-1">
                      <div className="text-[10px] font-mono text-[#8E8E88] uppercase">Email Address</div>
                      <div className="flex items-center justify-between gap-1">
                        <a
                          href={`mailto:${selectedApp.email}`}
                          className="text-xs font-mono text-white hover:text-cluster-acid truncate transition-colors"
                          title={selectedApp.email}
                        >
                          {selectedApp.email}
                        </a>
                        <button
                          onClick={() => handleCopyEmail(selectedApp.email)}
                          className="p-1 rounded text-gray-400 hover:text-white"
                          title="Copy Email"
                        >
                          {copiedEmail ? <Check className="w-3 h-3 text-cluster-acid" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Roll Number */}
                    <div className="p-3 rounded-2xl bg-[#121316] border border-white/[0.06] space-y-1">
                      <div className="text-[10px] font-mono text-[#8E8E88] uppercase">Roll / Student ID</div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                          {selectedApp.rollNumber || 'N/A'}
                        </span>
                        <button
                          onClick={() => handleCopyRoll(selectedApp.rollNumber)}
                          className="p-1 rounded text-gray-400 hover:text-white"
                          title="Copy Roll Number"
                        >
                          {copiedRoll ? <Check className="w-3 h-3 text-cluster-acid" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Degree / Course */}
                    <div className="p-3 rounded-2xl bg-[#121316] border border-white/[0.06] space-y-1">
                      <div className="text-[10px] font-mono text-[#8E8E88] uppercase">Course / Degree</div>
                      <div className="text-xs font-mono text-white font-semibold">
                        {selectedApp.course || 'B.Tech'}
                      </div>
                    </div>

                    {/* Academic Year */}
                    <div className="p-3 rounded-2xl bg-[#121316] border border-white/[0.06] space-y-1">
                      <div className="text-[10px] font-mono text-[#8E8E88] uppercase">Academic Year</div>
                      <div className="text-xs font-mono text-white font-semibold">
                        {selectedApp.year || '2nd Year'}
                      </div>
                    </div>

                    {/* Branch / Major */}
                    <div className="sm:col-span-2 p-3 rounded-2xl bg-[#121316] border border-white/[0.06] space-y-1">
                      <div className="text-[10px] font-mono text-[#8E8E88] uppercase">Branch / Major</div>
                      <div className="text-xs font-mono text-white truncate" title={selectedApp.branch || 'CSE'}>
                        {selectedApp.branch || 'Computer Science & Engineering'}
                      </div>
                    </div>
                  </div>

                  {/* External Profiles / Social Handles */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {selectedApp.github ? (
                      <a
                        href={getSafeUrl(selectedApp.github)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141518] border border-white/[0.08] hover:border-cluster-acid/50 text-xs font-mono text-white transition-colors group"
                      >
                        <Github className="w-3.5 h-3.5 text-cluster-acid group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">GitHub Profile</span>
                        <ExternalLink className="w-3 h-3 text-[#8E8E88] group-hover:text-white" />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono text-[#666]">
                        <Github className="w-3 h-3 opacity-50" />
                        <span>No GitHub</span>
                      </div>
                    )}

                    {selectedApp.linkedin ? (
                      <a
                        href={getSafeUrl(selectedApp.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141518] border border-white/[0.08] hover:border-cluster-acid/50 text-xs font-mono text-white transition-colors group"
                      >
                        <Linkedin className="w-3.5 h-3.5 text-cluster-acid group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">LinkedIn Profile</span>
                        <ExternalLink className="w-3 h-3 text-[#8E8E88] group-hover:text-white" />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono text-[#666]">
                        <Linkedin className="w-3.5 h-3.5 opacity-50" />
                        <span>No LinkedIn</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Selected Domains & Tracks (Full View) (5 columns) */}
                <div className="md:col-span-5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8E8E88] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>Selected Domains &amp; Circle Matches</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {getMatchedCircles(selectedApp.domain).map((cName) => {
                        const conf = CIRCLE_CONFIG[cName] || CIRCLE_CONFIG.Compute
                        return (
                          <span
                            key={cName}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${conf.color}`}
                          >
                            {cName}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#141518] border border-cluster-acid/30 flex-1 flex flex-col justify-start space-y-2.5 shadow-inner">
                    {parseDomains(selectedApp.domain).length > 0 ? (
                      parseDomains(selectedApp.domain).map((track, idx) => {
                        const circleName = getCircleForTrack(track)
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-[#0E0F12] border border-white/[0.08] hover:border-cluster-acid/50 transition-all flex items-start justify-between gap-3 group"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="text-xs sm:text-sm font-mono font-bold text-white group-hover:text-cluster-acid transition-colors leading-snug">
                                {track}
                              </div>
                              {circleName && (
                                <div className="text-[10px] font-mono text-[#8E8E88] flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid" />
                                  <span>{circleName} Circle</span>
                                </div>
                              )}
                            </div>
                            <span className="shrink-0 p-1 rounded-md bg-cluster-acid/10 text-cluster-acid border border-cluster-acid/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs font-mono text-[#8E8E88] italic text-center">
                        No specific domains selected.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* What they've built / Projects */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono text-white font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cluster-acid" />
                    <span>What They&apos;ve Built &amp; Shipped (Primary Signal)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8E8E88]">Portfolio / Experience</span>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141518] border border-cluster-acid/30 text-xs sm:text-sm text-[#E0E0DB] font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {selectedApp.projects ? selectedApp.projects : (
                    <span className="italic text-[#8E8E88]">No project portfolio details submitted.</span>
                  )}
                </div>
              </div>

              {/* Motivation & Builder Goals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono text-white font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Motivation &amp; Why CLUSTER</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8E8E88]">Statement of Purpose</span>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141518] border border-white/[0.08] text-xs sm:text-sm text-[#D4D4CD] font-sans leading-relaxed whitespace-pre-wrap select-text">
                  {selectedApp.motivation ? selectedApp.motivation : (
                    <span className="italic text-[#8E8E88]">No motivation statement submitted.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer: Status Pipeline */}
            <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#0E0F12] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs font-mono text-[#8E8E88] flex items-center gap-1.5">
                <span>Update Status:</span>
                <span className="text-white font-bold">{selectedApp.status}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['Pending', 'Under Review', 'Accepted', 'Waitlisted', 'Rejected'].map((status) => {
                  const isActive = selectedApp.status === status
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedApp.id, status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                        isActive
                          ? 'bg-cluster-acid text-black font-bold shadow-md shadow-cluster-acid/20 scale-105'
                          : 'bg-white/5 hover:bg-white/10 text-[#8E8E88] hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {status}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Webhook Configuration Modal */}
      {isSheetModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSheetModalOpen(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0C0D0E] border border-white/[0.1] p-6 sm:p-8 shadow-2xl text-[#F8F7F3] space-y-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cluster-acid/15 border border-cluster-acid/40 text-cluster-acid flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white">
                    Google Sheets Live Webhook Sync
                  </h3>
                  <p className="text-xs text-[#8E8E88] font-sans mt-0.5">
                    Stream new membership applications straight into your yearly Google Sheet in real time.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSheetModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8E8E88] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pill Indicator */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-mono ${sheetUrl
                ? 'bg-cluster-acid/10 border-cluster-acid/30 text-cluster-acid'
                : 'bg-amber-400/10 border-amber-400/25 text-amber-300'
              }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${sheetUrl ? 'bg-cluster-acid animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-bold">
                  {sheetUrl ? 'LIVE GOOGLE SHEET SYNC ACTIVE' : 'NO WEBHOOK CONFIGURED'}
                </span>
              </div>
              <span className="text-[11px] opacity-80">
                {sheetUrl ? 'Apps append to sheet automatically' : 'Saved in Supabase only'}
              </span>
            </div>

            {/* Webhook Input Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white font-bold flex items-center justify-between">
                <span>Google Apps Script Webhook URL</span>
                <span className="text-[11px] text-[#8E8E88] font-normal">Editable anytime per academic year</span>
              </label>
              <input
                type="url"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-4 py-3 rounded-xl bg-[#141517] border border-white/[0.1] text-white text-xs font-mono placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
              />
              <p className="text-[11px] text-[#8E8E88] font-sans leading-relaxed">
                When you create a new Google Sheet for the next academic year or cohort, simply deploy its script and paste the new URL above.
              </p>
            </div>

            {/* Action Buttons: Test Ping & Save */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestPing}
                disabled={!sheetUrlInput || isTestingPing}
                className="btn-cluster-secondary w-full sm:w-auto px-5 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 text-cluster-acid" />
                <span>{isTestingPing ? 'Sending Ping...' : 'Send Test Ping to Sheet'}</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsSheetModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#D4D4CD]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSheetUrl}
                  className="btn-cluster-primary px-6 py-2.5 text-xs font-semibold"
                >
                  Save Webhook URL
                </button>
              </div>
            </div>

            {/* Copyable Setup Guide */}
            <div className="pt-4 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cluster-acid" />
                  <span>Google Apps Script Template (Copy & Paste)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-cluster-acid border border-cluster-acid/30 flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080808] border border-white/[0.08] text-[11px] font-mono text-[#A8A8A0] max-h-44 overflow-y-auto leading-relaxed select-all">
                <pre className="whitespace-pre">{GOOGLE_APPS_SCRIPT_TEMPLATE}</pre>
              </div>

              <div className="text-[11px] text-[#8E8E88] font-sans space-y-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div><strong className="text-white">Step 1:</strong> In your Google Sheet, open <em>Extensions → Apps Script</em> and paste this code.</div>
                <div><strong className="text-white">Step 2:</strong> Click <em>Deploy → New deployment → Web app</em>.</div>
                <div className="pl-4 text-amber-300">
                  ⚠️ Set <strong>Execute as:</strong> <em>Me</em> &amp; <strong>Who has access:</strong> <strong className="underline">Anyone</strong> (If not set to "Anyone", Google blocks external web requests!).
                </div>
                <div><strong className="text-white">Step 3:</strong> Grant permissions ("Advanced → Go to project (unsafe) → Allow").</div>
                <div><strong className="text-white">Step 4:</strong> Paste the resulting Web app URL into the box above and click <em>Send Test Ping</em>.</div>
                <div className="text-[10px] text-gray-400 pt-1 border-t border-white/5">
                  💡 <strong>Verification test:</strong> Paste your Web App URL into any browser tab. If configured correctly, it will say: <em>"CLUSTER Google Sheet Webhook is active and reachable!"</em>. If it asks you to log in, "Who has access" was not set to "Anyone".
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

