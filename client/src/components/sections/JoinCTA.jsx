import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function JoinCTA() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-br from-obsidian-900 via-obsidian-850 to-obsidian-950 border border-cluster-green/35 p-8 sm:p-14 overflow-hidden shadow-cluster-glow text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Ambient orb */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cluster-cyan/8 rounded-full blur-3xl pointer-events-none -mt-16 -mr-16" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cluster-green/6 rounded-full blur-3xl pointer-events-none -mb-12 -ml-12" />

        <div className="space-y-3 max-w-xl relative z-10">
          <span className="px-3 py-1 rounded-full bg-cluster-green/10 border border-cluster-green/30 text-cluster-green text-xs font-mono inline-block">
            GALGOTIAS UNIVERSITY · OPEN INTAKE
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            READY TO{' '}
            <span className="text-cluster-gradient">BUILD · LEARN · CREATE?</span>
          </h2>
          <p className="text-sm text-gray-200 font-sans">
            Join CLUSTER and be part of a community that builds real projects, learns together, and pushes the boundaries of what's possible in tech.
          </p>
        </div>

        <Link
          to="/events"
          className="btn-cluster-primary shrink-0 relative z-10 px-8 py-4 text-base group"
        >
          <span>Apply for Membership</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
