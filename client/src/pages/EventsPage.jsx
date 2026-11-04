import { useState, useMemo, useEffect } from 'react'
import { Calendar, MapPin, ExternalLink, Image as ImageIcon, X, Filter } from 'lucide-react'
import { clusterDataService } from '../services/clusterDataService.js'

const TYPE_FILTERS = ['all', 'hackathon', 'workshop', 'talk', 'study']

export default function EventsPage() {
  const [eventsList, setEventsList] = useState(() => clusterDataService.getEvents())
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTab, setSelectedTab] = useState('upcoming')
  const [activeGalleryImages, setActiveGalleryImages] = useState(null)

  useEffect(() => {
    setEventsList(clusterDataService.getEvents())
    const handleEventsUpdate = () => {
      setEventsList(clusterDataService.getEvents())
    }
    window.addEventListener('cluster_events_updated', handleEventsUpdate)
    return () => window.removeEventListener('cluster_events_updated', handleEventsUpdate)
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]

  const normDate = (d) => {
    if (!d) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const parsed = new Date(d)
    return isNaN(parsed.getTime()) ? d : parsed.toISOString().split('T')[0]
  }

  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const evDate = normDate(ev.date)
      const isPast = evDate < todayStr
      const matchesTab = selectedTab === 'past' ? isPast : !isPast
      const matchesType = selectedType === 'all' || ev.type === selectedType
      return matchesTab && matchesType
    })
  }, [eventsList, selectedTab, selectedType, todayStr])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="text-xs font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-cluster-acid" />
          <span>SCHEDULE & ARCHIVES</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-black text-[#F8F7F3] tracking-tight leading-tight">
          HACKATHONS, WORKSHOPS &<br />
          <span className="text-cluster-gradient">COMMUNITY EVENTS</span>
        </h1>
        <p className="text-[#B5B5AE] text-sm sm:text-base leading-relaxed font-sans">
          From 24-hour build competitions to weekly study circles — there's always something happening at CLUSTER.
        </p>
      </div>

      {/* Filterable Event Schedule */}
      <div className="space-y-8">
        {/* Tab Switcher & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-obsidian-900/90 p-4 rounded-2xl border border-white/10">
          {/* Upcoming vs Past Tabs */}
          <div className="flex bg-obsidian-950 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`flex-1 sm:px-6 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTab === 'upcoming'
                  ? 'nav-pill-active'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Upcoming Schedule
            </button>
            <button
              onClick={() => setSelectedTab('past')}
              className={`flex-1 sm:px-6 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTab === 'past'
                  ? 'nav-pill-active'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Past Archives
            </button>
          </div>

          {/* Type Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-cluster-acid shrink-0 ml-2 hidden sm:block" />
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                  selectedType === t
                    ? 'bg-obsidian-800 border border-cluster-acid text-cluster-acid font-bold shadow-cluster-glow'
                    : 'bg-obsidian-950 text-gray-300 border border-white/10 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-obsidian-900/40 rounded-2xl border border-dashed border-white/10">
            <Calendar className="w-12 h-12 text-cluster-acid mx-auto mb-3 opacity-40" />
            <h4 className="text-lg font-display font-semibold text-white">No events in this category</h4>
            <p className="text-sm font-mono text-gray-400 mt-1">Check back soon or switch filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.slug} className="nvidia-card rounded-2xl overflow-hidden p-6 flex flex-col justify-between space-y-4 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-cluster-acid/10 border border-cluster-acid/25 text-cluster-acid text-[11px] font-mono font-bold uppercase">
                      {event.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>{event.date}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                    {event.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cluster-acid shrink-0" />
                    <span className="truncate max-w-[140px]">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {selectedTab === 'upcoming' && event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cluster-primary px-4 py-2 text-xs"
                      >
                        <span>RSVP</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {selectedTab === 'past' && event.gallery && event.gallery.length > 0 && (
                      <button
                        onClick={() => setActiveGalleryImages(event.gallery)}
                        className="px-3 py-1.5 rounded-lg bg-obsidian-800 border border-white/10 text-cluster-green text-xs font-mono hover:border-cluster-green transition-colors flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Photos ({event.gallery.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gallery Modal */}
        {activeGalleryImages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-obsidian-900 border border-cluster-green/35 rounded-2xl p-6 shadow-cluster-glow flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cluster-green" />
                  <span>Event Gallery</span>
                </h3>
                <button onClick={() => setActiveGalleryImages(null)} className="p-1.5 rounded-lg bg-obsidian-800 text-gray-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-1">
                {activeGalleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-obsidian-950 aspect-video">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
