import { useLayoutEffect } from 'react'

// First load only: the page starts black with a huddle of cursors. They fan out, drag grey wireframe
// blocks for every [data-build] element in view, then come back and fill each block in: text is typed
// with a caret, everything else fades up. Elements further down are built as they scroll into view by
// cursors that fly in from the edges. Plain DOM + Web Animations in page coordinates, no React state.
const KEY = 'cluster-built'
const COLORS = ['#C6FF4D', '#4D9FFF', '#FF7A4D', '#FF4DA6', '#B04DFF', '#4DFFE3', '#FFD84D', '#FF5C5C', '#7CFF8A', '#FF9F1C', '#5CE1FF', '#E04DFF', '#C6FF4D', '#4D9FFF', '#FF7A4D', '#FFD84D']
const EASE = 'cubic-bezier(.22,1,.36,1)'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const rand = (a, b) => a + Math.random() * (b - a)
let alive = false
let runs = 0
const typing = new Map() // text node -> full text, so a skip can restore half-typed copy

// Just outside the current viewport, in page coordinates
function offscreen() {
  const side = Math.floor(rand(0, 4))
  const x = side % 2 ? rand(-80, innerWidth + 80) : side ? innerWidth + 80 : -80
  const y = side % 2 ? (side === 1 ? -80 : innerHeight + 80) : rand(-80, innerHeight + 80)
  return [x + scrollX, y + scrollY]
}

function rect(node) {
  const r = node.getBoundingClientRect()
  return { left: r.left + scrollX, top: r.top + scrollY, right: r.right + scrollX, bottom: r.bottom + scrollY, width: r.width, height: r.height }
}

function el(parent, cls, html = '', css = '') {
  const d = document.createElement('div')
  d.className = cls
  d.innerHTML = html
  d.style.cssText = css
  parent.appendChild(d)
  return d
}

function cursor(layer, color) {
  const d = el(layer, 'cur', `<svg width="18" height="22" viewBox="0 0 18 22"><path d="M1 1l6 18 3-7 7-3z" fill="${color}" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>`)
  const c = { el: d, color, x: scrollX + innerWidth / 2 + rand(-70, 70), y: scrollY + innerHeight / 2 + rand(-50, 50) }
  d.style.transform = `translate(${c.x}px,${c.y}px)`
  return c
}

function move(c, x, y, duration = 250 + Math.hypot(x - c.x, y - c.y) * 0.5) {
  const a = c.el.animate([{ transform: `translate(${c.x}px,${c.y}px)` }, { transform: `translate(${x}px,${y}px)` }], { duration, easing: EASE, fill: 'forwards' })
  c.x = x
  c.y = y
  return a.finished
}

function jump(c, x, y) {
  c.el.getAnimations().forEach((a) => a.cancel())
  c.x = x
  c.y = y
  c.el.style.transform = `translate(${x}px,${y}px)`
}

const fade = (node, ms = 200) => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, fill: 'forwards' }).finished.then(() => node.remove())

function select(layer, r, grow) {
  const s = el(layer, 'sel', `<i></i><i></i><i></i><i></i><b>${Math.round(r.width)} × ${Math.round(r.height)}</b>`, `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`)
  if (grow) s.animate([{ width: 0, height: 0 }, { width: `${r.width}px`, height: `${r.height}px` }], { duration: grow, easing: EASE })
  return s
}

// Type every text node inside the element, one character at a time, with a caret the cursor follows
async function type(node, c, layer) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const parent = n.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      const tag = parent.tagName.toUpperCase()
      if (
        ['STYLE', 'SCRIPT', 'SVG', 'DEFS', 'PATH', 'CLIPPATH'].includes(tag) ||
        parent.closest('svg')
      ) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const texts = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.data.trim()) texts.push([n, n.data])
  texts.forEach(([n, full]) => { n.data = ''; typing.set(n, full) })
  node.style.opacity = ''
  const caret = el(layer, 'caret')
  const range = document.createRange()
  for (const [n, full] of texts) {
    for (const ch of full) {
      if (!alive) return
      n.data += ch
      range.setStart(n, n.data.length)
      range.collapse(true)
      const r = range.getBoundingClientRect()
      if (r.height) {
        caret.style.cssText = `left:${r.right + scrollX}px;top:${r.top + scrollY}px;height:${r.height}px`
        jump(c, r.right + scrollX + 6, r.bottom + scrollY - 2)
      }
      await wait(full.length > 20 ? 24 : 40)
    }
    typing.delete(n)
  }
  caret.remove()
}

// phase: 'block' draws the wireframe, 'fill' replaces it with the real element, 'both' does one after the other
async function build(c, layer, { el: target, phase }) {
  const kind = target.dataset.build || 'type'
  const r = rect(target)
  if (phase !== 'fill') {
    await move(c, r.left, r.top)
    const draw = 300 + Math.hypot(r.width, r.height) * 0.3
    const sel = select(layer, r, draw)
    if (kind !== 'frame') {
      target.blk = el(layer, 'blk', '', `left:${r.left}px;top:${r.top}px`)
      target.blk.animate([{ width: 0, height: 0 }, { width: `${r.width}px`, height: `${r.height}px` }], { duration: draw, easing: EASE, fill: 'forwards' })
    }
    await move(c, r.right, r.bottom, draw)
    await wait(220)
    await fade(sel)
    if (phase === 'block' || kind === 'frame') return
  }
  await move(c, r.left + rand(0, r.width * 0.3), r.top + rand(0, r.height))
  const sel = select(layer, r)
  fade(target.blk, 350)
  if (kind === 'type') {
    await type(target, c, layer)
  } else {
    target.style.opacity = ''
    target.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EASE })
    await wait(420)
  }
  await wait(160)
  await fade(sel)
}

export default function BuildIntro() {
  useLayoutEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const forceIntro = params && (params.has('intro') || params.has('swarm') || params.has('build'))
    const prefersReduced = !forceIntro && !import.meta.env.DEV && matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!forceIntro && (localStorage.getItem(KEY) || innerWidth < 768 || prefersReduced)) return undefined
    const targets = [...document.querySelectorAll('[data-build]')]
    const hidden = targets.filter((t) => t.dataset.build !== 'frame')
    for (const t of hidden) {
      t.style.opacity = '0'
      t.style.animation = 'none' // replaces the element's own rise/reveal
    }
    const layer = el(document.body, 'build-layer')
    layer.setAttribute('aria-hidden', 'true')
    const cover = el(layer, 'cover')
    const size = () => { layer.style.height = `${document.documentElement.scrollHeight}px` }
    size()

    const id = ++runs
    alive = true
    let park = false // after the first screen, idle cursors wait just off the edge instead of wandering
    const jobs = []
    let left = 0
    const run = async (c) => {
      while (alive) {
        const job = jobs.shift()
        if (job) {
          if (c.parked) jump(c, ...offscreen())
          c.parked = false
          await build(c, layer, job)
          left -= 1
        } else if (park) {
          if (!c.parked) await move(c, ...offscreen(), 500)
          c.parked = true
          await wait(150)
        } else {
          const far = Math.random() < 0.12
          await move(c, c.x + rand(-1, 1) * (far ? 300 : 50), c.y + rand(-1, 1) * (far ? 200 : 40), far ? 500 : rand(150, 320))
          if (Math.random() < 0.2) fade(el(layer, 'x', '+', `left:${c.x}px;top:${c.y}px;color:${c.color}`), 700)
        }
      }
    }
    const pass = async (phase, list, gap) => {
      left = list.length
      for (const t of list) {
        if (!alive) return
        jobs.push({ el: t, phase })
        await wait(gap)
      }
      while (alive && left > 0) await wait(50)
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        size()
        jobs.push({ el: e.target, phase: 'both' })
      }
    }, { rootMargin: '100000px 0px -12% 0px' }) // anything at or above the viewport counts, so a fast scroll skips nothing
    ;(async () => {
      await document.fonts.ready
      if (id !== runs || !alive) return // StrictMode's throwaway first mount: a later mount owns the flags now
      localStorage.setItem(KEY, '1')

      // Coordinate with Brand Preloader:
      // If the brand preloader is active, remove the black intro cover (avoiding duplicate covers)
      // and wait for the preloader to drop before fanning out cursors.
      if (typeof window !== 'undefined' && window.__clusterPreloaderActive) {
        if (cover) cover.remove()
        await new Promise((resolve) => {
          const onDone = () => {
            window.removeEventListener('cluster-loader-done', onDone)
            resolve()
          }
          window.addEventListener('cluster-loader-done', onDone)
        })
      } else {
        await wait(900)
        fade(cover, 600)
      }

      if (!alive) return
      const fold = scrollY + innerHeight
      const first = targets.filter((t) => rect(t).top < fold)
      const later = targets.filter((t) => rect(t).top >= fold)
      const cursors = COLORS.map((col) => cursor(layer, col))
      cursors.forEach((c, i) => setTimeout(() => run(c), i * 40))
      await pass('block', first, 130)
      await wait(300)
      await pass('fill', first.filter((t) => t.dataset.build !== 'frame'), 220)
      park = true
      left = later.length
      later.forEach((t) => io.observe(t))
      while (alive && left > 0) await wait(100)
      alive = false
      io.disconnect()
      await Promise.all(cursors.map((c) => move(c, ...offscreen(), 650)))
      layer.remove()
    })()

    // Skip: show everything as it would end up and drop the overlay
    const skip = () => {
      alive = false
      io.disconnect()
      layer.remove()
      typing.forEach((full, n) => { n.data = full })
      typing.clear()
      for (const t of hidden) t.style.opacity = ''
      removeEventListener('keydown', onKey)
    }
    const onKey = (e) => e.key === 'Escape' && skip()
    addEventListener('keydown', onKey)
    const btn = el(layer, 'skip', 'Skip <kbd>Esc</kbd>')
    btn.onclick = skip
    return skip
  }, [])
  return null
}
