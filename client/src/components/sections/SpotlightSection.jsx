import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { useLive } from '../../hooks/useLive.js'
import { eventStart } from '../../lib/eventStart.js'
import { Corners, DotWave, Eyebrow } from '../ui/Brand.jsx'

function useCountdown(target) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  return [['Days', Math.floor(s / 86400)], ['Hours', Math.floor(s / 3600) % 24], ['Min', Math.floor(s / 60) % 60], ['Sec', s % 60]]
}

export default function SpotlightSection() {
  const event = useLive('cluster_events_updated', () => clusterDataService.getSpotlightEvent())
  if (!event) return null
  return <Spotlight event={event} />
}

function Spotlight({ event }) {
  const start = eventStart(event)
  const parts = useCountdown(start.getTime())
  const day = start.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <section id="events" aria-labelledby="spotlight-heading" className="px-4 sm:px-8 lg:px-20 pb-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col gap-4 max-w-[680px]">
            <Eyebrow>Next up</Eyebrow>
            <h2 id="spotlight-heading" className="heading-2">The next one is<br />already on the calendar</h2>
          </div>
          <Link to="/events" className="btn btn-ghost self-start sm:self-auto">All events</Link>
        </div>

        <article className="reveal grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-line bg-cream">
          <div className="relative overflow-hidden bg-black text-white p-8 sm:p-12 flex flex-col justify-between gap-12 min-h-[420px]">
            <DotWave className="bottom-0 h-48 opacity-50" single />
            <Corners size="w-5 h-5" inset="top-6 left-6 right-6 bottom-6" className="border-white/80" />
            <div className="relative flex flex-col gap-4">
              <p className="caption-3 text-lime">{event.type || 'Event'}</p>
              <h3 className="heading-3">{event.title}</h3>
              <p className="body-3 text-soft max-w-sm line-clamp-3">{event.summary}</p>
            </div>
            <div className="relative flex items-end gap-3 sm:gap-6" role="timer" aria-label={`Starts ${day}`}>
              {parts.map(([label, v], i) => (
                <div key={label} className="flex items-end gap-3 sm:gap-6">
                  {i > 0 && <span aria-hidden="true" className="heading-2 text-graphite tick pb-6">:</span>}
                  <div className="flex flex-col gap-1">
                    <span className={`heading-2 tabular-nums overflow-hidden ${i === 3 ? 'text-lime' : ''}`}>
                      <span key={v} className="roll">{String(v).padStart(2, '0')}</span>
                    </span>
                    <span className="caption-3 text-mute">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 sm:p-12 flex flex-col justify-between gap-12">
            <ul className="flex flex-col gap-6">
              <li className="title-3 flex items-center gap-3"><Calendar className="w-5 h-5 shrink-0" />{day}</li>
              {event.time && <li className="title-3 flex items-center gap-3"><Clock className="w-5 h-5 shrink-0" />{event.time}</li>}
              {event.location && <li className="title-3 flex items-center gap-3"><MapPin className="w-5 h-5 shrink-0" />{event.location}</li>}
            </ul>
            {event.registrationUrl && (
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-black self-start">
                Save your spot <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
