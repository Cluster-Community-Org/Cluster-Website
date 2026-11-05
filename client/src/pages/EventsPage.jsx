import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Image as ImageIcon, MapPin, X } from 'lucide-react'
import { clusterDataService } from '../services/clusterDataService.js'
import { useLive } from '../hooks/useLive.js'
import { PageHeader } from '../components/ui/Brand.jsx'

const today = new Date().toISOString().slice(0, 10)
const isoDate = (d) => {
  if (!d || /^\d{4}-\d{2}-\d{2}$/.test(d)) return d || ''
  const p = new Date(d)
  return isNaN(p) ? d : p.toISOString().slice(0, 10)
}
const pill = (on) =>
  `title-4 capitalize rounded-full px-4 py-2 transition-colors duration-300 ${on ? 'bg-black text-white' : 'text-graphite hover:text-black'}`

export default function EventsPage() {
  const events = useLive('cluster_events_updated', () => clusterDataService.getEvents())
  const [tab, setTab] = useState('upcoming')
  const [type, setType] = useState('all')
  const [gallery, setGallery] = useState(null)

  const types = ['all', ...new Set(events.map((e) => e.type).filter(Boolean))]
  const shown = useMemo(
    () => events.filter((e) => (isoDate(e.date) < today) === (tab === 'past') && (type === 'all' || e.type === type)),
    [events, tab, type],
  )

  return (
    <div className="px-4 sm:px-8 lg:px-20 pb-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <PageHeader eyebrow="Events" title={<>Hackathons, workshops<br />and meetups</>}>
          From 24 hour build sprints to weekly study circles. Most of them are open to every student.
        </PageHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div aria-label="When" className="inline-flex self-start rounded-full border border-line bg-white p-1">
            {['upcoming', 'past'].map((t) => (
              <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={pill(tab === t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="Filter by type">
            {types.map((t) => (
              <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={`${pill(type === t)} border ${type === t ? 'border-black' : 'border-line bg-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="rounded-3xl border border-line bg-white px-6 py-16 flex flex-col items-center text-center gap-4">
            <Calendar className="w-10 h-10" />
            <h2 className="heading-5">Nothing {tab === 'past' ? 'in the archive' : 'scheduled'} here yet</h2>
            <p className="body-3 text-graphite max-w-sm">
              {tab === 'past' ? 'Past events show up here once they are done.' : 'New sessions get announced here first. Try another filter or apply to join so you hear about them.'}
            </p>
            <Link to="/join" className="btn btn-black">Apply to join <ArrowRight className="w-5 h-5" /></Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((e, i) => (
              <article key={e.slug || e.id} className={`reveal ${i % 2 ? 'reveal-2' : ''} lift rounded-2xl border border-line hover:border-black bg-white p-6 sm:p-8 flex flex-col gap-6`}>
                <div className="flex items-center justify-between gap-4">
                  <span className="caption-3 rounded-full bg-black text-lime px-3 py-2">{e.type}</span>
                  <span className="title-4 text-graphite flex items-center gap-2"><Calendar className="w-4 h-4" />{e.date}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="heading-6">{e.title}</h2>
                  <p className="body-6 text-graphite line-clamp-3">{e.summary}</p>
                </div>
                <div className="mt-auto pt-6 border-t border-line flex items-center justify-between gap-4">
                  <span className="title-4 text-graphite flex items-center gap-2 min-w-0"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate">{e.location}</span></span>
                  {tab === 'upcoming' && e.registrationUrl && (
                    <a href={e.registrationUrl} target="_blank" rel="noopener noreferrer" className="btn btn-black btn-sm shrink-0">RSVP <ArrowRight className="w-4 h-4" /></a>
                  )}
                  {tab === 'past' && e.gallery?.length > 0 && (
                    <button type="button" onClick={() => setGallery(e.gallery)} className="btn btn-ghost btn-sm shrink-0"><ImageIcon className="w-4 h-4" />Photos ({e.gallery.length})</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {gallery && (
        <div role="dialog" aria-modal="true" aria-label="Event photos" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setGallery(null)}>
          <div className="w-full max-w-4xl rounded-3xl bg-paper p-6 flex flex-col gap-4" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="heading-6">Event photos</h2>
              <button type="button" onClick={() => setGallery(null)} aria-label="Close photos" className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-3 max-h-[70vh] overflow-y-auto">
              {gallery.map((src, i) => (
                <img key={src} src={src} alt={`Event photo ${i + 1}`} className="w-full aspect-video object-cover rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
