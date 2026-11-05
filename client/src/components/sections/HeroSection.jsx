import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { useLive } from '../../hooks/useLive.js'
import { Corners, FullStop } from '../ui/Brand.jsx'
import HeroLiquid from './HeroLiquid.jsx'

export function LiveChip({ open }) {
  return (
    <span className="caption-3 inline-flex items-center gap-2 rounded-full border border-char-2 px-3 py-2 text-soft">
      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${open ? 'bg-lime blip' : 'bg-mute'}`} />
      {open ? 'Applications open' : 'Applications closed'}
    </span>
  )
}

export default function HeroSection() {
  const config = useLive('cluster_homepage_updated', () => clusterDataService.getHomepageConfig())
  const lines = (config.heroHeadline || 'Find your people.\nBuild together.').split('\n')

  return (
    <section aria-labelledby="hero-heading" className="-mt-20 px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="relative isolate overflow-hidden rounded-3xl bg-black text-white min-h-[calc(100svh-2rem)] flex flex-col justify-end px-6 pt-32 pb-16 sm:px-12 lg:px-20 lg:pb-24">
        <div aria-hidden="true" className="hero-grad" />
        <div aria-hidden="true" className="grain" />
        <div aria-hidden="true" className="hero-rim" />
        <HeroLiquid />
        <Corners inset="top-6 left-6 right-6 bottom-6" />

        <div className="relative flex flex-col gap-6 max-w-[680px]">
          <h1 id="hero-heading" className="heading-1 lg:text-7xl text-grad-dark rise">
            {lines.map((l, i) => (
              <span key={i} className="block">
                {i === lines.length - 1 ? <>{l.replace(/\.$/, '')}<FullStop /></> : l}
              </span>
            ))}
          </h1>

          {config.heroSubtitle && (
            <p className="title-2 text-soft rise" style={{ animationDelay: '100ms' }}>{config.heroSubtitle}</p>
          )}

          <div className="pt-2 rise" style={{ animationDelay: '200ms' }}>
            <Link to="/join" className="btn btn-lime">Apply to join <ArrowRight className="w-5 h-5" /></Link>
          </div>

          {config.statsEnabled && config.stats?.length > 0 && (
            <dl className="flex flex-wrap gap-8 pt-6 border-t border-char-2 rise" style={{ animationDelay: '300ms' }}>
              {config.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-1">
                  <dt className="caption-3 text-mute">{s.label}</dt>
                  <dd className="heading-5 tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}
