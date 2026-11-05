import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Eyebrow } from '../ui/Brand.jsx'

const CIRCLES = [
  { label: 'Dev & open source', title: 'Developer circle', body: 'Weekly code sessions, pair programming and open source contributions. First app or tenth, there is a seat for you.' },
  { label: 'Compute & AI', title: 'Compute & ML circle', body: 'Study groups, paper reading and hands on ML projects, from data pipelines to fine tuning models.' },
  { label: 'Peers & leadership', title: 'Mentorship circle', body: 'Seniors mentor newcomers and run the workshops. Leadership roles are earned by contribution, not by year.' },
]

export default function CirclesSection() {
  return (
    <section id="circles" aria-labelledby="circles-heading" className="px-2 sm:px-4">
      <div className="rounded-3xl bg-black text-white px-6 py-20 sm:px-12 lg:px-16 lg:py-24">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="reveal grid lg:grid-cols-12 lg:items-end gap-x-8 gap-y-6">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <Eyebrow className="text-lime">Circles</Eyebrow>
              <h2 id="circles-heading" className="heading-2 text-grad-dark">Three circles.<br />Pick one, or try all three.</h2>
            </div>
            <p className="lg:col-span-5 body-3 text-mute">Each circle runs its own sessions and its own projects. Switching is one message away.</p>
          </div>

          <ol className="divide-y divide-char-2 border-y border-char-2">
            {CIRCLES.map(({ label, title, body }, i) => (
              <li key={title} className={`reveal reveal-${i + 1}`}>
                <Link to="/join" className="group grid grid-cols-[1fr_auto] lg:grid-cols-12 items-center gap-x-8 gap-y-4 py-8 lg:py-12 [--press:.99]">
                  <div className="lg:col-span-6 flex flex-col gap-3">
                    <p className="caption-3 text-lime tabular-nums">0{i + 1} · {label}</p>
                    <h3 className="heading-3 transition-colors duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:text-lime"><span className="sr-only">Join the </span>{title}</h3>
                  </div>
                  <span aria-hidden="true" className="lg:order-last lg:col-span-1 justify-self-end w-12 h-12 rounded-full border border-graphite flex items-center justify-center transition-colors duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:bg-lime group-hover:border-lime group-hover:text-black">
                    <ArrowRight className="w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1" />
                  </span>
                  <p className="col-span-2 lg:col-span-5 body-3 text-mute">{body}</p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
