import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import { CircuitCanvas } from '../3d/CircuitCanvas.jsx'
import { clusterDataService } from '../../services/clusterDataService.js'

const DEFAULT_HERO_STATS = [
  { value: '150+', label: 'COMMUNITY MEMBERS',  color: 'text-cluster-acid', border: 'border-cluster-acid/40 shadow-cluster-glow' },
  { value: '20+',  label: 'EVENTS & SESSIONS',  color: 'text-white',        border: 'border-white/10' },
  { value: '10+',  label: 'SHIPPED PROJECTS',   color: 'text-cluster-acid', border: 'border-cluster-acid/30' },
  { value: '100%', label: 'OPEN COLLABORATION', color: 'text-white',        border: 'border-white/10' },
]

export default function HeroSection() {
  const [config, setConfig] = useState(() => clusterDataService.getHomepageConfig())

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(clusterDataService.getHomepageConfig())
    }
    window.addEventListener('cluster_homepage_updated', handleUpdate)
    return () => window.removeEventListener('cluster_homepage_updated', handleUpdate)
  }, [])

  const stats = (config.stats && config.stats.length > 0) ? config.stats : DEFAULT_HERO_STATS

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] flex flex-col justify-center overflow-hidden bg-[#080808] border-b border-white/[0.08] px-4 py-6 sm:py-8 lg:py-10">
      {/* Circuit Canvas Ambient Micro-animation */}
      <CircuitCanvas />

      {/* Subtle Restrained Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-cluster-acid/[0.05] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Content (Vertically centered and tuned to fit single screen without scroll) */}
      <div className="relative z-10 max-w-5xl mx-auto my-auto text-center flex flex-col justify-center items-center space-y-4 sm:space-y-5 lg:space-y-6 w-full">

        {/* Hero Headline (Pure Editorial Brand Board Direction, No awkward double period) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-[#F8F7F3] leading-[1.06]">
          Find your people.<br />
          <span className="text-cluster-gradient">Build together</span>
          <span className="inline-block w-3 sm:w-3.5 h-3 sm:h-3.5 bg-cluster-acid ml-2 rounded-sm align-baseline shadow-[0_0_10px_rgba(198,255,77,0.5)]" />
        </h1>

        {/* Brand Concept Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm lg:text-base text-[#C2C2B8] font-sans leading-relaxed">
          {config.heroSubtitle || (
            <>
              <strong className="text-white font-semibold">A community around compute.</strong> Good things happen in clusters — join a space to build real projects, learn practical skills, collaborate with peers, and share your curiosity.
            </>
          )}
        </p>

        {/* Editorial Value Anchors (Clean, Non-SaaS, Elegant) */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs font-mono text-[#8E8E88] tracking-wider uppercase">
          <span className="text-[#F8F7F3] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid" />
            Community
          </span>
          <span className="text-gray-600">/</span>
          <span className="hover:text-white transition-colors">Collaboration</span>
          <span className="text-gray-600">/</span>
          <span className="hover:text-white transition-colors">Belonging</span>
          <span className="text-gray-600">/</span>
          <span className="hover:text-white transition-colors">Shared Curiosity</span>
        </div>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full sm:w-auto">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open_join_modal'))}
            className="btn-cluster-primary w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-semibold group cursor-pointer active:scale-[0.98] transition-transform"
          >
            <span>Join the Community</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/events"
            className="btn-cluster-secondary w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-semibold group active:scale-[0.98] transition-transform"
          >
            <Zap className="w-4 h-4 text-cluster-acid group-hover:scale-110 transition-transform" />
            <span>Explore Events & Meetups</span>
          </Link>
        </div>

        {/* Metric Bar: High-contrast, Architectural, 1px Hairline Borders */}
        <div className="pt-2 sm:pt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-4xl text-left font-mono">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="py-3 px-4 rounded-xl bg-[#0F1012]/90 border border-white/[0.08] hover:border-cluster-acid/30 transition-colors backdrop-blur-md"
            >
              <div className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight tabular-nums font-mono ${idx % 2 === 0 ? 'text-cluster-acid' : 'text-white'}`}>
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#8E8E88] font-medium tracking-wider mt-0.5 uppercase truncate">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
