import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Eyebrow } from '../ui/Brand.jsx'

const CIRCLES = [
  { name: 'Developer', label: 'Dev & open source', title: 'Developer circle', body: 'Weekly code sessions, pair programming and open source contributions. First app or tenth, there is a seat for you.' },
  { name: 'Compute & ML', label: 'Compute & AI', title: 'Compute & ML circle', body: 'Study groups, paper reading and hands on ML projects, from data pipelines to fine tuning models.' },
  { name: 'Mentorship', label: 'Peers & leadership', title: 'Mentorship circle', body: 'Seniors mentor newcomers and run the workshops. Leadership roles are earned by contribution, not by year.' },
]

const DIM = 0.4

// A fixed dot grid whose dots swell where a slowly circling light hits the sphere.
function Sphere({ active, phase }) {
  const ref = useRef(null)
  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let level = activeRef.current ? 1 : DIM
    let raf = 0
    let last = 0

    const draw = (t) => {
      const target = activeRef.current ? 1 : DIM
      level = still ? target : level + (target - level) * 0.12

      const dpr = Math.min(devicePixelRatio, 2)
      const size = canvas.clientWidth
      const px = Math.round(size * dpr)
      if (canvas.width !== px || canvas.height !== px) canvas.width = canvas.height = px
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)

      const mid = size / 2
      const r = mid - 2
      const step = r < 120 ? 5 : 7
      const angle = (still ? 0 : t * 0.00018) + phase
      const lx = Math.cos(angle) * 0.8
      const ly = Math.sin(angle) * 0.35 - 0.4

      const white = new Path2D()
      const lime = new Path2D()
      const edge = Math.floor(r / step) * step // keeps the grid centred, so the outline stays symmetric
      for (let y = -edge; y <= edge; y += step) {
        for (let x = -edge; x <= edge; x += step) {
          const nx = x / r
          const ny = y / r
          const d2 = nx * nx + ny * ny
          if (d2 > 1) continue
          const lit = Math.max(0, nx * lx + ny * ly + Math.sqrt(1 - d2) * 0.45)
          const v = Math.min(1, lit + d2 * d2 * 0.35)
          const dot = (0.25 + v * step * 0.42) * (0.6 + level * 0.4)
          const path = v > 0.62 ? lime : white
          path.moveTo(mid + x + dot, mid + y)
          path.arc(mid + x, mid + y, dot, 0, Math.PI * 2)
        }
      }
      ctx.globalAlpha = level
      ctx.fillStyle = '#F8F8F5'
      ctx.fill(white)
      ctx.fillStyle = '#C6FF4D'
      ctx.fill(lime)
    }

    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      if (t - last > 33) {
        last = t
        draw(t)
      }
    }
    draw(performance.now())
    // Only animate while on screen
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) raf = requestAnimationFrame(tick)
    })
    io.observe(canvas)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [phase])

  return <canvas ref={ref} aria-hidden="true" className="block w-full h-full" />
}

export default function CirclesSection() {
  const [on, setOn] = useState(1)
  const select = (i) => ({ onMouseEnter: () => setOn(i), onFocus: () => setOn(i), onClick: () => setOn(i) })

  return (
    <section id="circles" aria-labelledby="circles-heading" className="px-2 sm:px-4">
      <div className="rounded-3xl bg-black text-white px-6 py-20 sm:px-12 lg:px-16 lg:py-24">
        <div className="max-w-7xl mx-auto flex flex-col gap-12 lg:gap-16">
          <div className="reveal grid lg:grid-cols-12 lg:items-end gap-x-8 gap-y-6">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Eyebrow className="text-lime">Circles</Eyebrow>
              <h2 id="circles-heading" className="heading-2">Three circles.<br />Pick one, or try all three.</h2>
            </div>
            <p className="lg:col-span-5 body-3 text-mute pb-2">Each circle runs its own sessions and its own projects. Switching is one message away.</p>
          </div>

          <div className="orbs">
            {CIRCLES.map((c, i) => (
              <button
                key={c.title}
                type="button"
                aria-label={c.title}
                aria-pressed={on === i}
                {...select(i)}
                className={`orb orb-${i} ${on === i ? 'text-lime' : 'text-mute'}`}
              >
                <Sphere active={on === i} phase={i * 2.1} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap title-3">{c.name}</span>
              </button>
            ))}
          </div>

          {/* Stacked in one grid cell so swapping text never changes the height */}
          <div aria-live="polite" className="grid pt-8 border-t border-char-2">
            {CIRCLES.map((c, i) => (
              <div key={c.title} inert={on !== i} className={`[grid-area:1/1] grid lg:grid-cols-12 lg:items-center gap-x-8 gap-y-4 transition-opacity duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${on === i ? '' : 'opacity-0'}`}>
                <div className="lg:col-span-5 flex flex-col gap-2">
                  <p className="caption-3 text-lime">{c.label}</p>
                  <h3 className="heading-3">{c.title}</h3>
                </div>
                <p className="lg:col-span-4 body-3 text-soft">{c.body}</p>
                <div className="lg:col-span-3 lg:justify-self-end">
                  <Link to="/join" className="btn btn-lime">Join this circle <ArrowRight className="w-5 h-5" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
