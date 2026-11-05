import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { useLive } from '../../hooks/useLive.js'
import { Corners, DotWave, Eyebrow, Square } from '../ui/Brand.jsx'

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
  const words = (config.heroSubtitle || '').split(/\s+/).filter(Boolean)

  return (
    <section aria-labelledby="hero-heading" className="-mt-20 px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-black text-white min-h-[calc(100svh-2rem)] flex flex-col justify-end px-6 pt-32 pb-16 sm:px-12 lg:px-20 lg:pb-24">
        <DotWave />
        <Corners inset="top-6 left-6 right-6 bottom-6" />

        <div className="relative flex flex-col gap-8 max-w-[680px]">
          <Eyebrow className="text-lime rise" square="bg-lime">Student tech community · Galgotias University</Eyebrow>

          <h1 id="hero-heading" className="heading-1 lg:text-7xl text-grad-dark rise" style={{ animationDelay: '100ms' }}>
            {lines.map((l, i) => (
              <span key={i} className="block">
                {l}
                {i === lines.length - 1 && <Square className="w-3 h-3 sm:w-4 sm:h-4 ml-4" pulse />}
              </span>
            ))}
          </h1>

          {words.length > 0 && (
            <p className="title-2 text-soft max-w-xl">
              {words.map((w, i) => (
                <span key={i} className="rise inline-block" style={{ animationDelay: `${350 + i * 45}ms` }}>
                  {w}&nbsp;
                </span>
              ))}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 rise" style={{ animationDelay: `${450 + words.length * 45}ms` }}>
            <Link to="/join" className="btn btn-lime">Apply to join Cluster <ArrowRight className="w-5 h-5" /></Link>
            <Link to="/events" className="btn btn-ghost-dark">See upcoming events</Link>
            <LiveChip open={config.applicationsOpen !== false} />
          </div>

          {config.statsEnabled && config.stats?.length > 0 && (
            <dl className="flex flex-wrap gap-8 pt-6 border-t border-char-2 rise" style={{ animationDelay: '900ms' }}>
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
