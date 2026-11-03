import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, ChevronRight } from 'lucide-react'

const FEATURED_EVENTS = [
  {
    id: 1,
    title: 'Kickstart \'26 — Community Meetup',
    description: 'A community meetup for tech students who care about compute. Meet the community, explore project showcases, and discover what\'s next.',
    date: 'Dec 05, 2026',
    category: 'Community Meetup',
  },
  {
    id: 2,
    title: 'CLUSTER Hackathon Season 1',
    description: '24-hour build competition — teams of 2–4 solve high-impact briefs across Web3, AI, and developer tools. Cash prizes and industry mentorship.',
    date: 'Dec 15, 2026',
    category: 'Hackathon',
  },
  {
    id: 3,
    title: 'Full-Stack Web Dev Bootcamp',
    description: 'Hands-on full-stack workshop covering React, Tailwind, and Node.js. Ship real software from scratch in a guided collaborative sprint.',
    date: 'Nov 20, 2026',
    category: 'Workshop',
  },
]

export default function FeaturedSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10" aria-label="Featured events">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <span className="text-xs font-mono text-cluster-acid uppercase tracking-wider font-semibold">
            FEATURED HIGHLIGHTS // SPRINT SESSIONS
          </span>
          <h2 className="text-3xl font-display font-bold text-white">UPCOMING MEETUPS & SESSIONS</h2>
        </div>
        <Link to="/events" className="text-sm font-semibold text-cluster-acid hover:text-white flex items-center gap-1 group transition-colors">
          <span>View All Events</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
        {FEATURED_EVENTS.map((event) => (
          <article key={event.id} className="nvidia-card rounded-2xl p-6 space-y-4 flex flex-col justify-between group" role="listitem">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cluster-acid bg-cluster-acid/10 px-2.5 py-1 rounded border border-cluster-acid/20 font-semibold">
                  {event.category.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
              </div>

              <h3 className="text-xl font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                {event.title}
              </h3>

              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                {event.description}
              </p>
            </div>

            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 group-hover:text-cluster-acid transition-colors pt-2 border-t border-white/5"
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
