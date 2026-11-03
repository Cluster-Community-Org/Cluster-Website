import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Users } from 'lucide-react'
import { CircuitCanvas } from '../3d/CircuitCanvas.jsx'

const HERO_STATS = [
  { value: '150+', label: 'COMMUNITY MEMBERS',  color: 'text-cluster-acid', border: 'border-cluster-acid/40 shadow-cluster-glow' },
  { value: '20+',  label: 'EVENTS & SESSIONS',  color: 'text-white',        border: 'border-white/10' },
  { value: '10+',  label: 'SHIPPED PROJECTS',   color: 'text-cluster-acid', border: 'border-cluster-acid/30' },
  { value: '100%', label: 'OPEN COLLABORATION', color: 'text-white',        border: 'border-white/10' },
]

export default function HeroSection() {
  return (
    <section className="relative h-[100dvh] min-h-[620px] max-h-[860px] flex flex-col justify-between overflow-hidden bg-black border-b border-white/10 px-4 pt-24 pb-6">
      {/* Circuit Canvas Micro-animation */}
      <CircuitCanvas />

      {/* Ambient Radial Lighting — Crisp Acid Green */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-cluster-acid/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto my-auto text-center space-y-5 sm:space-y-6">

        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-obsidian-900 border border-white/10 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cluster-acid animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid/60" />
            <span className="w-1 h-1 rounded-full bg-cluster-acid/30" />
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-gray-300 tracking-wider uppercase">
            STUDENT TECH COMMUNITY &nbsp;·&nbsp; <span className="text-cluster-acid font-bold">CLUSTER</span>
          </span>
        </div>

        {/* Hero Headline (Brand Kit Official) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.08]">
          Find your people.<br />
          <span className="text-cluster-gradient">Build together.</span>
          <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 bg-cluster-acid ml-2 rounded-sm align-baseline" />
        </h1>

        {/* Brand Concept Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm lg:text-base text-gray-300 font-sans leading-relaxed">
          <strong className="text-white">A community around compute.</strong> Good things happen in clusters — join a space to build real projects, learn practical skills, collaborate with peers, and share your curiosity.
        </p>

        {/* Value Pills matching brand kit */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {['Community', 'Collaboration', 'Belonging', 'Shared Curiosity'].map((pill, idx) => (
            <span
              key={pill}
              className={`px-3.5 py-1 rounded-full text-[11px] font-mono transition-all ${
                idx === 0
                  ? 'bg-cluster-acid text-black font-bold shadow-[0_0_15px_rgba(198,255,77,0.35)]'
                  : 'text-gray-300 bg-obsidian-900 border border-white/10 hover:border-cluster-acid/40'
              }`}
            >
              {pill}
            </span>
          ))}
        </div>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/events"
            className="btn-cluster-primary w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm group"
          >
            <span>Join the Community</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/events"
            className="btn-cluster-secondary w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm group"
          >
            <Zap className="w-4 h-4 text-cluster-acid group-hover:scale-110 transition-transform" />
            <span>Explore Events & Meetups</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left font-mono">
          {HERO_STATS.map((stat, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl bg-obsidian-900/80 border ${stat.border} backdrop-blur-md`}>
              <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] sm:text-[11px] text-gray-300 font-semibold tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
