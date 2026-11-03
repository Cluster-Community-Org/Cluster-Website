import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Users } from 'lucide-react'
import { CircuitCanvas } from '../3d/CircuitCanvas.jsx'

const HERO_STATS = [
  { value: '150+', label: 'MEMBERS',       color: 'text-cluster-green', border: 'border-cluster-green/50 shadow-cluster-glow' },
  { value: '20+',  label: 'EVENTS HOSTED', color: 'text-cluster-cyan',  border: 'border-cluster-cyan/40 shadow-cyan-glow' },
  { value: '10+',  label: 'PROJECTS',      color: 'text-cluster-green', border: 'border-cluster-green/30' },
  { value: '5+',   label: 'PARTNERS',      color: 'text-white',         border: 'border-white/20' },
]

export default function HeroSection() {
  return (
    <section className="relative h-[100dvh] min-h-[580px] max-h-[820px] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 border-b border-white/10 px-4 pt-20 pb-5">
      {/* Circuit Board Canvas Micro-animation */}
      <CircuitCanvas />

      {/* Ambient Glowing Orbs — CLUSTER palette */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cluster-green/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cluster-cyan/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-56 h-56 bg-cluster-green/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto my-auto text-center space-y-4 sm:space-y-5">

        {/* Identity Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-obsidian-900/90 border border-cluster-green/40 backdrop-blur-md shadow-cluster-glow">
          <Users className="w-3.5 h-3.5 text-cluster-green" />
          <span className="text-[11px] sm:text-xs font-mono text-gray-200">
            GALGOTIAS UNIVERSITY&nbsp;&nbsp;·&nbsp;&nbsp;<span className="text-cluster-green font-bold">CLUSTER</span>
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
          BUILD · LEARN · COLLABORATE<br />
          <span className="text-cluster-gradient">CREATE YOUR FUTURE IN TECH</span>
        </h1>

        {/* Mission Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm lg:text-base text-gray-200 font-sans leading-relaxed">
          The premier student technology society at Galgotias University — a place to{' '}
          <span className="text-cluster-green font-semibold">build real projects</span>,{' '}
          learn from peers, collaborate across disciplines, and create the technology of tomorrow.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/events"
            className="btn-cluster-primary w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm group"
          >
            <span>Join CLUSTER</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/events"
            className="btn-cluster-secondary w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm group"
          >
            <Zap className="w-4 h-4 text-cluster-green group-hover:scale-110 transition-transform" />
            <span>Explore Events</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left font-mono">
          {HERO_STATS.map((stat, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl bg-obsidian-900/80 border ${stat.border} backdrop-blur-md`}>
              <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] sm:text-[11px] text-gray-200 font-semibold tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
