import { Award, Github, Linkedin, Target } from 'lucide-react'
import { clusterDataService } from '../services/clusterDataService.js'
import { useLive } from '../hooks/useLive.js'
import { getSafeUrl } from '../lib/safeUrl.js'
import { DotWave, Eyebrow, PageHeader } from '../components/ui/Brand.jsx'

const VALUES = [
  { Icon: Target, title: 'Our mission', body: 'Cluster exists to make compute, peer learning and builder culture easy to reach. Students build real projects, learn practical skills, work across teams and explore what comes next.' },
  { Icon: Award, title: 'Student first', body: 'Every decision starts with what is best for members. Leadership is earned by contribution, knowledge is shared freely, and every student has a place here, whatever their year or background.' },
]

export default function TeamPage() {
  const team = useLive('cluster_team_updated', () => clusterDataService.getTeamMembers())

  return (
    <div className="px-4 sm:px-8 lg:px-20 pb-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-24">
        <PageHeader eyebrow="Team" title={<>The people who<br />run Cluster</>}>
          Student builders, designers and researchers who keep the circles running and the projects shipping.
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {VALUES.map(({ Icon, title, body }, i) => (
            <article key={title} className={`reveal ${i ? 'reveal-2' : ''} relative overflow-hidden rounded-3xl p-8 sm:p-12 flex flex-col gap-6 ${i ? 'bg-cream border border-line' : 'bg-black text-white'}`}>
              {!i && <DotWave className="bottom-0 h-40 opacity-40" single />}
              <span className={`relative w-12 h-12 rounded-lg flex items-center justify-center ${i ? 'bg-black text-lime' : 'border border-char-3 text-lime'}`}><Icon className="w-6 h-6" /></span>
              <h2 className="relative heading-3">{title}</h2>
              <p className={`relative title-2 ${i ? 'text-graphite' : 'text-soft'}`}>{body}</p>
            </article>
          ))}
        </div>

        <section aria-labelledby="board-heading" className="flex flex-col gap-12">
          <div className="reveal flex flex-col gap-4">
            <Eyebrow>Executive board</Eyebrow>
            <h2 id="board-heading" className="heading-2">Student officers</h2>
          </div>
          {team.length === 0 ? (
            <p className="reveal rounded-3xl border border-line bg-cream px-6 py-16 text-center title-2 text-graphite">The founding team is being announced soon.</p>
          ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <article key={m.id} className={`reveal ${['', 'reveal-2', 'reveal-3', 'reveal-3'][i % 4]} lift rounded-2xl border border-line hover:border-black bg-cream p-6 flex flex-col gap-6`}>
                <div className="relative h-48 rounded-xl bg-black flex items-center justify-center">
                  <span className="heading-3 text-lime">{m.initials}</span>
                  {m.graduationYear && <span className="absolute top-3 right-3 caption-3 rounded-full border border-char-3 px-3 py-1 text-soft">Class of {m.graduationYear}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="heading-6">{m.name}</h3>
                  <p className="title-4 text-graphite">{m.role}</p>
                </div>
                <p className="body-6 text-graphite line-clamp-3">{m.bio}</p>
                {(getSafeUrl(m.github) || getSafeUrl(m.linkedin)) && (
                  <div className="mt-auto pt-4 border-t border-line flex gap-2">
                    {getSafeUrl(m.github) && <a href={getSafeUrl(m.github)} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub`} className="p-2 rounded-full hover:bg-black/5"><Github className="w-5 h-5" /></a>}
                    {getSafeUrl(m.linkedin) && <a href={getSafeUrl(m.linkedin)} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="p-2 rounded-full hover:bg-black/5"><Linkedin className="w-5 h-5" /></a>}
                  </div>
                )}
              </article>
            ))}
          </div>
          )}
        </section>
      </div>
    </div>
  )
}
