import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Cpu, Share2 } from 'lucide-react'
import { DotWave, Eyebrow } from '../ui/Brand.jsx'

const CIRCLES = [
  { Icon: Code2, label: 'Dev & open source', title: 'Developer circle', body: 'Weekly code sessions, pair programming and open source contributions. First app or tenth, there is a seat for you.' },
  { Icon: Cpu, label: 'Compute & AI', title: 'Compute & ML circle', body: 'Study groups, paper reading and hands on ML projects, from data pipelines to fine tuning models.' },
  { Icon: Share2, label: 'Peers & leadership', title: 'Mentorship circle', body: 'Seniors mentor newcomers and run the workshops. Leadership roles are earned by contribution, not by year.' },
]

export default function CirclesSection() {
  return (
    <section id="circles" aria-labelledby="circles-heading" className="px-2 sm:px-4">
      <div className="relative overflow-hidden rounded-3xl bg-black text-white px-6 py-20 sm:px-12 lg:px-16 lg:py-24">
        <DotWave className="top-0 h-56 -scale-y-100 opacity-25" single />
        <div className="relative max-w-7xl mx-auto flex flex-col gap-12">
          <div className="reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-12">
            <div className="flex flex-col gap-4 max-w-[680px]">
              <Eyebrow className="text-lime">Circles</Eyebrow>
              <h2 id="circles-heading" className="heading-2 text-grad-dark">Three circles.<br />Pick one, or try all three.</h2>
            </div>
            <p className="body-3 text-mute max-w-sm">Each circle runs its own sessions and its own projects. Switching is one message away.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {CIRCLES.map(({ Icon, label, title, body }, i) => (
              <article key={title} className={`reveal reveal-${i + 1} lift group rounded-2xl border border-char-2 bg-char-1 hover:border-lime px-6 py-8 flex flex-col gap-8 min-h-[360px]`}>
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-lg border border-char-3 bg-black text-lime flex items-center justify-center"><Icon className="w-6 h-6" /></span>
                  <span className="caption-3 text-mute tabular-nums">0{i + 1}</span>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <p className="caption-3 text-lime">{label}</p>
                  <h3 className="heading-5">{title}</h3>
                  <p className="body-6 text-mute">{body}</p>
                </div>
                <Link to="/join" className="title-4 inline-flex items-center gap-2 text-white hover:text-lime">
                  Join this circle <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
