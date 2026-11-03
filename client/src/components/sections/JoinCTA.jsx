import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function JoinCTA() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-[#0F1012] border border-white/[0.08] p-8 sm:p-14 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-10">
        {/* Subtle Ambient Acid Green Corner Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cluster-acid/[0.06] rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />

        <div className="space-y-4 max-w-xl relative z-10">
          <div className="text-xs font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center gap-2 justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-sm bg-cluster-acid" />
            <span>A COMMUNITY AROUND COMPUTE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-[#F8F7F3] tracking-tight leading-tight">
            FIND YOUR PEOPLE.<br />
            <span className="text-cluster-gradient">BUILD TOGETHER.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#B5B5AE] font-sans leading-relaxed">
            Good things happen in clusters. Connect with fellow developers, build ambitious projects, and collaborate in an environment built by students, for students.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 justify-center sm:justify-start text-xs font-mono text-[#8E8E88] tracking-wider uppercase">
            <span>// Community</span>
            <span>// Collaboration</span>
            <span>// Belonging</span>
            <span>// Shared Curiosity</span>
          </div>
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open_join_modal'))}
          className="btn-cluster-primary shrink-0 relative z-10 px-8 py-4 text-sm font-semibold group active:scale-[0.98] transition-transform cursor-pointer"
        >
          <span>Join CLUSTER Community</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  )
}
