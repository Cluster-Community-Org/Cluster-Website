import { BookOpen, Box, Compass, Layers, Presentation, Terminal, Users, Zap } from 'lucide-react'
import { DotWave, Eyebrow, PixelCluster, TONES } from '../ui/Brand.jsx'

const REPOS = [['your-first-project', 'shipped', true], ['team-hackathon-build', 'in progress', true], ['next-idea', 'next', false]]
const TILES = [
  [BookOpen, 'Paper club', 'Read one, argue about it', false],
  [Zap, 'Hack nights', 'Build until something works', true],
  [Box, 'Build sprints', 'Short sprint, one shipped thing', true],
  [Presentation, 'Showcases', 'Demo what you made', false],
]

const CARDS = [
  {
    tone: 'light', label: 'Community', Icon: Users, title: 'People who get it',
    body: 'Weekly sessions with students who would rather build something than scroll. Most of them end with someone starting a project.',
    visual: (
      <div className="relative overflow-hidden rounded-2xl bg-black min-h-[360px] flex items-center justify-center text-lime">
        <DotWave className="bottom-0 h-48" single />
        <Users className="relative w-28 h-28" strokeWidth={1.2} />
      </div>
    ),
  },
  {
    tone: 'dark', label: 'Build', Icon: Layers, title: 'Real projects under your name',
    body: "Join a circle, pick a project, ship it. Code and demos go on GitHub under your name, not the club's.",
    visual: (
      <div className="rounded-2xl border border-char-2 bg-char-1 min-h-[360px] p-6 flex flex-col justify-end gap-3">
        {REPOS.map(([name, state, on]) => (
          <div key={name} className="flex items-center gap-3 rounded-lg border border-char-3 bg-black p-4">
            <span aria-hidden="true" className={`w-2.5 h-2.5 rounded-full ${on ? 'bg-lime' : 'bg-mute'}`} />
            <span className="title-4 font-mono">{name}</span>
            <span className="caption-5 text-mute ml-auto">{state}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tone: 'lime', label: 'Compute', Icon: Terminal, title: 'Hands on compute',
    body: 'Sessions on systems, GPUs and ML pipelines, run by members who have already done it once and want you to skip their mistakes.',
    visual: (
      <div className="rounded-2xl bg-black text-white min-h-[360px] p-8 flex flex-col justify-between font-mono text-sm">
        <p className="text-lime">you@cluster ~</p>
        <div className="flex flex-col gap-2">
          <p className="text-mute">$ git clone the-project-you-joined</p>
          <p>$ pip install -r requirements.txt</p>
          <p className="text-lime">$ python train.py --epochs 12 <span className="tick">▍</span></p>
        </div>
      </div>
    ),
  },
  {
    tone: 'light', label: 'Explore', Icon: Compass, title: 'A semester ahead of the syllabus',
    body: "Paper reading groups, hack nights and build sprints on what is next, not what was on last year's exam.",
    visual: (
      <div className="grid grid-cols-2 gap-3 min-h-[360px]">
        {TILES.map(([Icon, title, sub, dark]) => (
          <div key={title} className={`rounded-2xl p-6 flex flex-col justify-between ${dark ? 'bg-black text-white' : 'bg-paper border border-line'}`}>
            <Icon className={`w-7 h-7 ${dark ? 'text-lime' : ''}`} />
            <div>
              <p className="title-3">{title}</p>
              <p className={`body-6 ${dark ? 'text-mute' : 'text-graphite'}`}>{sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

export default function WhyJoinSection() {
  return (
    <section aria-labelledby="why-heading" className="relative px-4 sm:px-8 lg:px-20 pt-24 sm:pt-32 pb-32">
      <PixelCluster className="w-24 h-24 right-32 -top-16" />
      <div className="max-w-7xl mx-auto flex flex-col gap-12 lg:gap-16">
        <div className="reveal flex flex-col items-center text-center gap-4">
          <h2 id="why-heading" className="heading-1">Why join Cluster</h2>
          <p className="title-2 text-graphite">Not a club you list on a résumé and forget.</p>
        </div>

        <div className="flex flex-col gap-6 pb-24">
          {CARDS.map(({ tone, label, Icon, title, body, visual }, i) => {
            const t = TONES[tone]
            return (
              <article
                key={title}
                className={`stack-card grid lg:grid-cols-2 gap-8 lg:gap-16 items-center rounded-3xl border p-6 sm:p-10 lg:p-16 lg:min-h-[520px] ${t.card}`}
                style={{ top: 96 + i * 24 }}
              >
                <div className="flex flex-col gap-6">
                  <span className={`lg:hidden w-12 h-12 rounded-lg bg-black text-lime flex items-center justify-center ${tone === 'dark' ? 'border border-char-3' : ''}`}>
                    <Icon className="w-6 h-6" />
                  </span>
                  <Eyebrow className={`${t.eyebrow} tabular-nums`} square={t.sq}>0{i + 1} / 04 · {label}</Eyebrow>
                  <h3 className={`heading-2 ${tone === 'dark' ? 'text-grad-dark' : ''}`}>{title}</h3>
                  <p className={`title-2 max-w-md ${t.body}`}>{body}</p>
                </div>
                <div className="hidden lg:block" aria-hidden="true">{visual}</div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
