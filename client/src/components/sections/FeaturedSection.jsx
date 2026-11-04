import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, ChevronRight } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'

export default function FeaturedSection() {
  const [events, setEvents] = useState(() => clusterDataService.getEvents().slice(0, 3))

  useEffect(() => {
    setEvents(clusterDataService.getEvents().slice(0, 3))
    const handleUpdate = () => {
      setEvents(clusterDataService.getEvents().slice(0, 3))
    }
    window.addEventListener('cluster_events_updated', handleUpdate)
    return () => window.removeEventListener('cluster_events_updated', handleUpdate)
  }, [])

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 border-b border-white/[0.06]" aria-label="Featured events">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-cluster-acid uppercase tracking-widest font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-sm bg-cluster-acid" />
            <span>FEATURED SESSIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-[#F8F7F3] tracking-tight">
            UPCOMING MEETUPS & SESSIONS
          </h2>
        </div>
        <Link to="/events" className="text-xs font-mono font-semibold uppercase tracking-wider text-cluster-acid hover:text-white flex items-center gap-1.5 group transition-colors">
          <span>View All Events</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl p-7 space-y-5 flex flex-col justify-between bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/40 transition-all duration-200 group"
            role="listitem"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cluster-acid uppercase tracking-wider font-semibold">
                  {event.type || event.category || 'Session'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#8E8E88] font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
              </div>

              <h3 className="text-xl font-display font-bold text-[#F8F7F3] group-hover:text-cluster-acid transition-colors leading-snug">
                {event.title}
              </h3>

              <p className="text-sm text-[#B5B5AE] leading-relaxed font-sans line-clamp-3">
                {event.summary || event.description}
              </p>
            </div>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E88] group-hover:text-cluster-acid transition-colors pt-4 border-t border-white/[0.06]"
            >
              <span>Explore details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
