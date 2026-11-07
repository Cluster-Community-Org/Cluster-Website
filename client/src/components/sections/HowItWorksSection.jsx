import { Zap } from 'lucide-react'
import { Eyebrow, PixelCluster, TONES } from '../ui/Brand.jsx'

const PIPELINE = [['Received', true], ['Under review', true], ['Call', false], ['Decision', false]]

export const STEPS = [
  {
    tone: 'light', title: "Show us what you've built",
    body: 'Links to repos, a hackathon you entered, a class project you took further than the brief, a bot that broke twice. Rough is fine. Finished is not required.',
    visual: (
      <div className="rounded-2xl border border-line bg-paper p-6 flex flex-col gap-3">
        <p className="caption-3 text-graphite">GitHub or portfolio</p>
        <p className="body-3 rounded-lg border border-line bg-cream px-3 py-2">github.com/you</p>
        <p className="caption-3 text-graphite">Something you built, broke or shipped</p>
        <p className="body-3 rounded-lg border border-black bg-cream px-3 py-2">A Discord bot for the hostel mess menu. Broke twice, fixed both.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {['Hackathon entry', 'Open source PR', 'Class project, extended'].map((c, i) => (
            <span key={c} className={`caption-3 rounded-full border px-3 py-2 ${i === 0 ? 'border-black bg-black text-white' : 'border-line'}`}>{c}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    tone: 'dark', title: 'We read all of it',
    body: 'Selection is on what you have done and where you want to go, not on grades, branch or year. Shortlisted applicants get a short chat with a circle lead.',
    visual: (
      <div className="rounded-2xl border border-char-2 bg-char-1 p-6 flex flex-col gap-6">
        <p className="title-3">Your application</p>
        <div className="grid grid-cols-4 gap-2">
          {PIPELINE.map(([label, on]) => (
            <div key={label} className="flex flex-col gap-2">
              <span className={`h-1.5 rounded-full ${on ? 'bg-lime' : 'bg-char-3'}`} />
              <span className={`caption-3 ${label === 'Under review' ? 'text-lime' : 'text-mute'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    tone: 'lime', title: 'Get placed in a circle',
    body: 'You hear back by email once the round closes, with the circle and mentor that fit what you showed us. Not the right fit? Switching is one message away.',
    visual: (
      <div className="flex flex-col gap-2">
        {['Crew circle', 'Compute circle', 'Applied AI & Simulation circle'].map((c, i) => (
          <div key={c} className={`flex items-center justify-between rounded-xl px-5 py-4 ${i === 0 ? 'bg-black text-white' : 'border border-black'}`}>
            <span className="title-3">{c}</span>
            {i === 0 && <span className="caption-3 text-lime">Matched</span>}
          </div>
        ))}
      </div>
    ),
  },
  {
    tone: 'light', title: 'Build and ship',
    body: 'Join a project team, show up to the sessions, and demo what you made at the next showcase. Then it goes on the list you send the next person.',
    visual: (
      <div className="flex items-center gap-4 rounded-2xl bg-lime p-6">
        <Zap className="w-10 h-10 shrink-0" strokeWidth={1.8} />
        <div>
          <p className="title-3">Demo day</p>
          <p className="body-6 text-char-1">Your name on the slide, your repo or your poster on the screen.</p>
        </div>
      </div>
    ),
  },
]

export default function HowItWorksSection() {
  return (
    <section aria-labelledby="how-heading" className="relative px-4 sm:px-8 lg:px-20 py-32">
      <PixelCluster className="w-32 h-32 right-24 top-28" float="float-slow" />
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <div className="reveal flex flex-col gap-4 max-w-[680px]">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-heading" className="heading-2">From what you&apos;ve built<br />to what you build next</h2>
        </div>

        <ol className="flex flex-col gap-4 pb-16">
          {STEPS.map(({ tone, title, body, visual }, i) => {
            const t = TONES[tone]
            return (
              <li
                key={title}
                className={`stack-card grid lg:grid-cols-[120px_1fr_1fr] gap-6 lg:gap-12 items-center rounded-3xl border p-6 sm:p-10 lg:px-16 lg:py-12 lg:min-h-[420px] ${t.card}`}
                style={{ top: 96 + i * 16 }}
              >
                <span className={`heading-1 tabular-nums ${tone === 'dark' ? 'text-lime' : ''}`}>0{i + 1}</span>
                <div className="flex flex-col gap-3">
                  <h3 className="heading-3">{title}</h3>
                  <p className={`title-2 ${t.body}`}>{body}</p>
                </div>
                <div className="hidden lg:block" aria-hidden="true">{visual}</div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
