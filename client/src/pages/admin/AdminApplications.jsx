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
} from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
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

const DOMAINS = [
  'All Domains',
  'AI & Machine Learning',
  'Full-Stack Web Dev',
  'Mobile & Systems',
  'Design & Creative Tech',
  'Cloud & DevOps',
  'Open Source & Dev Tools',
]

const STATUS_TABS = ['All', 'Pending', 'Under Review', 'Accepted', 'Waitlisted', 'Rejected']

export default function AdminApplications() {
  const { showToast } = useToast()
  const [applications, setApplications] = useState(() => clusterDataService.getApplications())
  const [search, setSearch] = useState('')
  const [selectedStatusTab, setSelectedStatusTab] = useState('All')
  const [selectedDomain, setSelectedDomain] = useState('All Domains')
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    const handleUpdate = () => {
      setApplications(clusterDataService.getApplications())
    }
    window.addEventListener('cluster_applications_updated', handleUpdate)
    return () => window.removeEventListener('cluster_applications_updated', handleUpdate)
  }, [])

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.rollNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.domain || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      selectedStatusTab === 'All' ? true : app.status === selectedStatusTab

    const matchesDomain =
      selectedDomain === 'All Domains' ? true : app.domain === selectedDomain

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

        <button
          onClick={handleExportCSV}
          className="btn-cluster-secondary px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-cluster-acid" />
          <span>Export CSV</span>
        </button>
      </div>

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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  selectedStatusTab === tab
                    ? 'bg-cluster-acid text-black font-bold'
                    : 'text-[#8E8E88] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedStatusTab === tab ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
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
              {DOMAINS.map((dom) => (
                <option key={dom} value={dom} className="bg-[#141517] text-white">
                  {dom}
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
                        <div className="font-semibold text-white group-hover:text-cluster-acid transition-colors">
                          {app.fullName}
                        </div>
                        <div className="text-[11px] text-[#8E8E88] font-mono mt-0.5">
                          {app.email} · {app.rollNumber}
                        </div>
                      </td>

                      {/* Domain Column */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{app.domain}</div>
                        <div className="text-[11px] text-[#8E8E88] font-mono mt-0.5">
                          {app.branchYear}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0C0D0E] border border-white/[0.1] p-6 sm:p-8 space-y-6 text-[#F8F7F3]">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold tracking-widest text-cluster-acid uppercase">
                APPLICANT DOSSIER // {selectedApp.id}
              </div>
              <h2 className="text-2xl font-display font-black text-white">
                {selectedApp.fullName}
              </h2>
              <div className="text-xs font-mono text-[#8E8E88]">
                Submitted {new Date(selectedApp.submittedAt).toLocaleString()}
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#141517] border border-white/[0.08] text-xs font-mono">
              <div>
                <div className="text-[10px] text-[#8E8E88]">Email Address</div>
                <div className="text-white mt-0.5 truncate">{selectedApp.email}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8E8E88]">Roll / Student ID</div>
                <div className="text-white mt-0.5">{selectedApp.rollNumber}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8E8E88]">Branch & Year</div>
                <div className="text-white mt-0.5">{selectedApp.branchYear}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8E8E88]">Primary Domain</div>
                <div className="text-cluster-acid mt-0.5">{selectedApp.domain}</div>
              </div>
            </div>

            {/* Motivation Statement */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                Motivation & Builder Goals
              </div>
              <div className="p-4 rounded-2xl bg-[#141517] border border-white/[0.08] text-xs text-[#D4D4CD] font-sans leading-relaxed whitespace-pre-wrap">
                {selectedApp.motivation || 'No statement provided.'}
              </div>
            </div>

            {/* Profiles & Links */}
            <div className="flex items-center gap-3">
              {selectedApp.github && (
                <a
                  href={selectedApp.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#141517] border border-white/[0.08] hover:border-cluster-acid/50 text-xs font-mono text-white flex items-center gap-2"
                >
                  <Github className="w-4 h-4 text-cluster-acid" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              )}
              {selectedApp.linkedin && (
                <a
                  href={selectedApp.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#141517] border border-white/[0.08] hover:border-cluster-acid/50 text-xs font-mono text-white flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4 text-cluster-acid" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              )}
            </div>

            {/* Status Pipeline Controls */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div className="text-xs font-mono text-[#8E8E88]">Candidate Status:</div>
              <div className="flex items-center gap-2">
                {['Pending', 'Under Review', 'Accepted', 'Waitlisted', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedApp.id, status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      selectedApp.status === status
                        ? 'bg-cluster-acid text-black font-bold'
                        : 'bg-white/5 text-[#8E8E88] hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

