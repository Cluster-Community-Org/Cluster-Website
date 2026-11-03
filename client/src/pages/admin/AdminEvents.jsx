import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Zap,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'

export default function AdminEvents() {
  const [events, setEvents] = useState(() => clusterDataService.getEvents())
  const [spotlightEvent, setSpotlightEvent] = useState(() => clusterDataService.getSpotlightEvent())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '10:00 AM IST',
    location: 'C-Block Auditorium',
    type: 'workshop',
    summary: '',
    registrationUrl: 'https://github.com/alwin2134/Cluster',
    isSpotlight: false,
    featured: true,
  })

  // Refresh data on custom events
  useEffect(() => {
    const handleEventsUpdate = () => {
      setEvents(clusterDataService.getEvents())
      setSpotlightEvent(clusterDataService.getSpotlightEvent())
    }
    const handleSpotlightUpdate = (e) => {
      setSpotlightEvent(e.detail || clusterDataService.getSpotlightEvent())
      setEvents(clusterDataService.getEvents())
    }

    window.addEventListener('cluster_events_updated', handleEventsUpdate)
    window.addEventListener('cluster_spotlight_updated', handleSpotlightUpdate)

    return () => {
      window.removeEventListener('cluster_events_updated', handleEventsUpdate)
      window.removeEventListener('cluster_spotlight_updated', handleSpotlightUpdate)
    }
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.summary && ev.summary.toLowerCase().includes(search.toLowerCase())) ||
      (ev.location && ev.location.toLowerCase().includes(search.toLowerCase()))
    const matchesType = typeFilter === 'all' || ev.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleOpenAdd = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      time: '10:00 AM IST',
      location: 'C-Block Auditorium',
      type: 'workshop',
      summary: '',
      registrationUrl: 'https://github.com/alwin2134/Cluster',
      isSpotlight: false,
      featured: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev)
    setFormData({
      title: ev.title || '',
      date: ev.date || '',
      time: ev.time || '10:00 AM IST',
      location: ev.location || '',
      type: ev.type || 'workshop',
      summary: ev.summary || '',
      registrationUrl: ev.registrationUrl || 'https://github.com/alwin2134/Cluster',
      isSpotlight: Boolean(ev.isSpotlight),
      featured: Boolean(ev.featured),
    })
    setModalOpen(true)
  }

  const handleDelete = (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      clusterDataService.deleteEvent(id)
      showToast(`Event "${title}" removed successfully.`)
    }
  }

  const handleSetSpotlight = (id, title) => {
    clusterDataService.setSpotlightEvent(id)
    showToast(`⭐ "${title}" is now the active Homepage Spotlight event!`)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.date) return

    if (editingEvent) {
      clusterDataService.saveEvent({ ...formData, id: editingEvent.id })
      if (formData.isSpotlight) {
        clusterDataService.setSpotlightEvent(editingEvent.id)
      }
      showToast(`Updated "${formData.title}"`)
    } else {
      const saved = clusterDataService.saveEvent({ ...formData })
      if (formData.isSpotlight && saved[0]) {
        clusterDataService.setSpotlightEvent(saved[0].id)
      }
      showToast(`Created new event "${formData.title}"`)
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-obsidian-900 border border-cluster-acid/60 text-white text-xs font-mono shadow-cluster-glow animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-cluster-acid" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid text-[11px] font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EVENT SPOTLIGHT & CONTENT CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Events & Hackathons Management
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Configure public workshops, manage registrations, and choose which event gets spotlighted on the homepage.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-cluster-primary px-4 py-2.5 text-xs flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* ── Active Spotlight Showcase Card ── */}
      {spotlightEvent && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-900 via-obsidian-900 to-obsidian-950 border border-cluster-acid/40 p-6 shadow-cluster-glow">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cluster-acid/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cluster-acid/20 border border-cluster-acid/50 text-cluster-acid text-[10px] font-mono font-bold tracking-wider">
                <Zap className="w-3.5 h-3.5 animate-bounce" />
                <span>CURRENT HOMEPAGE SPOTLIGHT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                {spotlightEvent.title}
              </h2>
              <p className="text-xs text-gray-300 line-clamp-2">
                {spotlightEvent.summary}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-400 pt-1">
                <span className="flex items-center gap-1 text-cluster-acid font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {spotlightEvent.date}
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-cluster-acid" />
                  {spotlightEvent.time}
                </span>
                <span className="flex items-center gap-1 text-gray-300 truncate max-w-xs">
                  <MapPin className="w-3.5 h-3.5 text-cluster-acid" />
                  {spotlightEvent.location}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <Link
                to="/"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-obsidian-950 border border-cluster-acid/40 text-cluster-acid hover:bg-cluster-acid hover:text-black transition-all text-xs font-mono font-semibold text-center flex items-center justify-center gap-1.5"
              >
                <span>View on Public Home</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => handleOpenEdit(spotlightEvent)}
                className="px-4 py-2 rounded-xl bg-obsidian-800 border border-white/10 hover:border-white/30 text-white transition-all text-xs font-mono text-center flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Spotlight</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title, keywords or venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:border-cluster-green focus:outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-white text-xs font-mono focus:border-cluster-green focus:outline-none"
        >
          <option value="all">All Categories ({events.length})</option>
          <option value="workshop">Workshops</option>
          <option value="hackathon">Hackathons</option>
          <option value="study">Study Circles</option>
          <option value="talk">Tech Talks</option>
        </select>
      </div>

      {/* ── Events Table ── */}
      <div className="nvidia-card rounded-2xl border border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian-950 border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Event Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Spotlight Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((ev) => {
                const isCurrentSpotlight = spotlightEvent && spotlightEvent.id === ev.id
                return (
                  <tr
                    key={ev.id}
                    className={`hover:bg-white/5 transition-colors ${
                      isCurrentSpotlight ? 'bg-cluster-green/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-display font-semibold text-white text-sm">
                        {ev.title}
                      </div>
                      <div className="text-[11px] text-gray-400 line-clamp-1 max-w-md mt-0.5 font-sans">
                        {ev.summary}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-obsidian-800 border border-white/10 text-cluster-acid uppercase font-bold text-[10px]">
                        {ev.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div>{ev.date}</div>
                      <div className="text-[10px] text-gray-500">{ev.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      {isCurrentSpotlight ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cluster-acid/20 border border-cluster-acid/50 text-cluster-acid font-bold text-[10px]">
                          <Star className="w-3.5 h-3.5 fill-cluster-acid text-cluster-acid" />
                          <span>HOMEPAGE SPOTLIGHT</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSetSpotlight(ev.id, ev.title)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-obsidian-800 border border-white/10 text-gray-400 hover:text-cluster-acid hover:border-cluster-acid/40 transition-colors text-[10px]"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Make Spotlight</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(ev)}
                          className="p-1.5 rounded-lg bg-obsidian-900 text-gray-300 hover:text-cluster-acid hover:border-cluster-acid/40 border border-white/10 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id, ev.title)}
                          className="p-1.5 rounded-lg bg-obsidian-900 text-gray-300 hover:text-red-400 hover:border-red-500/40 border border-white/10 transition-colors"
                          title="Delete Event"
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
      </div>

      {/* ── Modal (Create / Edit Event) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-obsidian-900 border border-cluster-acid/40 rounded-2xl p-6 shadow-cluster-glow space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-bold text-lg text-white">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. CLUSTER Hackathon Season 1"
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Time *</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="10:00 AM IST"
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Workshop</option>
                    <option value="study">Study Circle</option>
                    <option value="talk">Tech Talk</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Location / Venue</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="C-Block Auditorium"
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Registration URL</label>
                <input
                  type="url"
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  placeholder="https://github.com/alwin2134/Cluster"
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Summary / Description</label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Describe the event, prize pool, or curriculum..."
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none resize-none font-sans"
                />
              </div>

              {/* Spotlight Toggle */}
              <div className="p-3 rounded-xl bg-obsidian-950 border border-cluster-acid/30 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-cluster-acid fill-cluster-acid" />
                    <span>Set as Active Homepage Spotlight</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Renders the live countdown timer on the homepage for this event.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isSpotlight}
                  onChange={(e) => setFormData({ ...formData, isSpotlight: e.target.checked })}
                  className="w-4 h-4 accent-cluster-acid rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-obsidian-950 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cluster-primary px-5 py-2 text-xs font-semibold"
                >
                  {editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
