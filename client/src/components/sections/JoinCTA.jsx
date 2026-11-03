import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function JoinCTA() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-br from-obsidian-900 via-black to-obsidian-900 border border-white/10 p-8 sm:p-14 overflow-hidden shadow-cluster-glow text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Ambient Acid Green orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cluster-acid/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none -mb-12 -ml-12" />

        <div className="space-y-3 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GOOD THINGS HAPPEN IN CLUSTERS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            FIND YOUR PEOPLE.<br />
            <span className="text-cluster-gradient">BUILD TOGETHER.</span>
          </h2>

          <p className="text-sm text-gray-300 font-sans leading-relaxed">
            A community around compute. Connect with fellow developers, build ambitious projects, and collaborate in an environment built by students, for students.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {['Community', 'Collaboration', 'Belonging', 'Shared Curiosity'].map((val) => (
              <span
                key={val}
                className="text-[11px] font-mono text-gray-400 bg-black/60 px-2.5 py-1 rounded-md border border-white/5"
              >
                // {val}
              </span>
            ))}
          </div>
        </div>

        <Link
          to="/events"
          className="btn-cluster-primary shrink-0 relative z-10 px-8 py-4 text-base group"
        >
          <span>Join CLUSTER Community</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
