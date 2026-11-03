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
        {FEATURED_EVENTS.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl p-7 space-y-5 flex flex-col justify-between bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/40 transition-all duration-200 group"
            role="listitem"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cluster-acid uppercase tracking-wider font-semibold">
                  {event.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#8E8E88] font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
              </div>

              <h3 className="text-xl font-display font-bold text-[#F8F7F3] group-hover:text-cluster-acid transition-colors leading-snug">
                {event.title}
              </h3>

              <p className="text-sm text-[#B5B5AE] leading-relaxed font-sans">
                {event.description}
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
