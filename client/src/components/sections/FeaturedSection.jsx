import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, ChevronRight } from 'lucide-react'

const FEATURED_EVENTS = [
  {
    id: 1,
    title: 'Web Dev Bootcamp',
    description: 'Hands-on full-stack workshop covering React, Tailwind, and deploying real projects — from zero to deployed in a weekend.',
    date: 'Nov 20, 2026',
    category: 'Workshop',
  },
  {
    id: 2,
    title: 'CLUSTER Hackathon S1',
    description: '24-hour build competition — teams of 2–4 solve a real-world brief with any stack they choose. Prizes & mentors included.',
    date: 'Dec 5, 2026',
    category: 'Hackathon',
  },
  {
    id: 3,
    title: 'AI & ML Study Circle',
    description: 'Weekly peer-led sessions on machine learning fundamentals — from linear regression to fine-tuning large language models.',
    date: 'Every Friday',
    category: 'Study Circle',
  },
]

export default function FeaturedSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10" aria-label="Featured events">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <span className="text-xs font-mono text-cluster-green uppercase tracking-wider">FEATURED HIGHLIGHTS</span>
          <h2 className="text-3xl font-display font-bold text-white">UPCOMING EVENTS</h2>
        </div>
        <Link to="/events" className="text-sm font-semibold text-cluster-green hover:underline flex items-center gap-1 group">
          <span>View All Events</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
        {FEATURED_EVENTS.map((event) => (
          <article key={event.id} className="nvidia-card rounded-2xl p-6 space-y-4 flex flex-col justify-between group" role="listitem">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cluster-green bg-cluster-green/10 px-2.5 py-1 rounded border border-cluster-green/20 font-semibold">
                  {event.category.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
              </div>

              <h3 className="text-xl font-display font-bold text-white group-hover:text-cluster-green transition-colors">
                {event.title}
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed">
                {event.description}
              </p>
            </div>

            <Link to="/events" className="pt-4 border-t border-white/10 text-sm font-semibold text-cluster-green flex items-center gap-2 group/link">
              <span>Event Details</span>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
