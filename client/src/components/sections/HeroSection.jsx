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
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#080808] border-b border-white/[0.08] px-4 pt-28 pb-10">
      {/* Circuit Canvas Ambient Micro-animation */}
      <CircuitCanvas />

      {/* Subtle Restrained Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-cluster-acid/[0.06] rounded-full blur-[160px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto my-auto text-center space-y-6 sm:space-y-8 pt-4">

        {/* Hero Headline (Pure Editorial Brand Board Direction) */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black tracking-tight text-[#F8F7F3] leading-[1.02]">
          Find your people.<br />
          <span className="text-cluster-gradient">Build together.</span>
          <span className="inline-block w-3.5 h-3.5 sm:w-4 sm:h-4 bg-cluster-acid ml-2 rounded-sm align-baseline" />
        </h1>

        {/* Brand Concept Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-[#C2C2B8] font-sans leading-relaxed">
          <strong className="text-white font-semibold">A community around compute.</strong> Good things happen in clusters — join a space to build real projects, learn practical skills, collaborate with peers, and share your curiosity.
        </p>

        {/* Editorial Value Anchors (Clean, Non-SaaS, Elegant) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-xs font-mono text-[#8E8E88] tracking-wider uppercase">
          <span className="text-[#F8F7F3] font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid" />
            Community
          </span>
          <span className="text-gray-400">/</span>
          <span className="hover:text-white transition-colors">Collaboration</span>
          <span className="text-gray-400">/</span>
          <span className="hover:text-white transition-colors">Belonging</span>
          <span className="text-gray-400">/</span>
          <span className="hover:text-white transition-colors">Shared Curiosity</span>
        </div>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
          <Link
            to="/events"
            className="btn-cluster-primary w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-semibold group"
          >
            <span>Join the Community</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/events"
            className="btn-cluster-secondary w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-semibold group"
          >
            <Zap className="w-4 h-4 text-cluster-acid group-hover:scale-110 transition-transform" />
            <span>Explore Events & Meetups</span>
          </Link>
        </div>

        {/* Metric Bar: High-contrast, Architectural, 1px Hairline Borders */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left font-mono">
          {HERO_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#0F1012]/90 border border-white/[0.08] hover:border-cluster-acid/30 transition-colors backdrop-blur-md"
            >
              <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-[#8E8E88] font-medium tracking-wider mt-1 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
