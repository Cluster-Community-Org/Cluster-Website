import { useId } from 'react'
import { Link } from 'react-router-dom'

const MARK =
  'M76,437 L72,446 L69,458 L69,474 L73,488 L80,500 L229,666 L240,677 L251,683 L259,685 L464,685 L474,682 L483,677 L533,622 L533,618 L530,615 L298,615 L291,613 L284,609 L160,472 L157,466 L156,456 L161,446 L230,380 L245,373 L374,373 L381,375 L388,379 L420,413 L443,435 L454,439 L486,439 L496,435 L502,430 L514,416 L516,407 L513,395 L440,315 L430,309 L418,306 L214,306 L199,310 L190,315 L183,321 L82,428 Z M314,194 L262,249 L260,253 L262,258 L264,259 L455,259 L465,264 L479,278 L498,300 L589,398 L593,406 L593,415 L590,422 L528,482 L519,487 L512,489 L403,489 L399,488 L389,483 L343,435 L329,429 L280,429 L271,432 L254,448 L252,452 L251,467 L256,477 L325,550 L329,553 L343,559 L349,560 L551,560 L564,557 L577,550 L663,455 L674,441 L681,425 L682,403 L678,390 L671,378 L503,197 L497,193 L483,188 L328,188 L321,190 Z'
const SPARKS = [
  'M24,183 L19,194 L18,201 L19,208 L24,219 L32,227 L115,271 L121,273 L132,274 L142,271 L149,266 L153,261 L157,252 L158,242 L154,230 L147,222 L127,211 L67,174 L54,169 L42,170 L32,175 Z',
  'M140,71 L130,80 L125,90 L124,100 L128,112 L178,181 L179,184 L185,190 L196,195 L206,195 L214,192 L226,180 L229,169 L227,158 L222,149 L191,102 L178,80 L171,73 L160,68 L148,68 Z',
  'M277,18 L266,23 L259,30 L255,38 L254,51 L272,140 L274,144 L281,151 L289,155 L300,156 L305,155 L314,150 L322,140 L324,134 L324,123 L313,46 L309,32 L301,23 L290,18 Z',
]

// Official traced emblem (public/cluster-mark.svg). Sparks pulse in sequence when animated.
export function ClusterMark({ className = 'w-9 h-9', markColor = 'currentColor', sparkColor = '#C6FF4D', animated = false }) {
  return (
    <svg viewBox="0 0 701 704" className={className} aria-hidden="true">
      <path d={MARK} fill={markColor} fillRule="evenodd" />
      {SPARKS.map((d, i) => (
        <path key={i} d={d} fill={sparkColor} className={animated ? 'spark' : undefined} style={animated ? { animationDelay: `${i * 0.12}s` } : undefined} />
      ))}
    </svg>
  )
}

export function ClusterLogo({ className = '', markClass = 'w-7 h-7', textClass = 'text-base' }) {
  return (
    <Link to="/" aria-label="Cluster home" className={`inline-flex items-center gap-2 ${className}`}>
      <ClusterMark className={markClass} animated />
      <span className={`${textClass} font-bold tracking-[0.08em]`}>CLUSTER</span>
    </Link>
  )
}

// Card tones for the scroll stacks: white, black, lime.
export const TONES = {
  light: { card: 'bg-white border-line text-black', body: 'text-graphite', eyebrow: 'text-graphite', sq: 'bg-lime' },
  dark: { card: 'bg-black border-char-2 text-white', body: 'text-soft', eyebrow: 'text-lime', sq: 'bg-lime' },
  lime: { card: 'bg-lime border-black/10 text-black', body: 'text-char-1', eyebrow: 'text-black', sq: 'bg-black' },
}

export function Square({ className = 'w-3 h-3', pulse = false }) {
  return <span aria-hidden="true" className={`inline-block bg-lime ${pulse ? 'sq-pulse' : ''} ${className}`} />
}

export function Eyebrow({ children, className = 'text-graphite', square = 'bg-lime' }) {
  return (
    <p className={`caption-3 flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className={`w-2 h-2 shrink-0 ${square}`} />
      {children}
    </p>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="flex flex-col gap-6 max-w-[680px] pt-8 sm:pt-16">
      <Eyebrow className="text-graphite rise">{eyebrow}</Eyebrow>
      <h1 className="heading-1 text-grad-light rise" style={{ animationDelay: '100ms' }}>{title}</h1>
      {children && <p className="title-2 text-graphite rise" style={{ animationDelay: '200ms' }}>{children}</p>}
    </header>
  )
}

export function Corners({ className = 'border-white', size = 'w-6 h-6', inset = 'top-6 left-6 right-6 bottom-6' }) {
  const [t, l, r, b] = inset.split(' ')
  const c = `pointer-events-none absolute border-2 ${size} ${className}`
  return (
    <>
      <span aria-hidden="true" className={`${c} ${t} ${l} border-r-0 border-b-0`} />
      <span aria-hidden="true" className={`${c} ${t} ${r} border-l-0 border-b-0`} />
      <span aria-hidden="true" className={`${c} ${b} ${l} border-r-0 border-t-0`} />
      <span aria-hidden="true" className={`${c} ${b} ${r} border-l-0 border-t-0`} />
    </>
  )
}

// Three 800 unit periods so a -800 unit drift loops without a seam.
export function wavePath(h, y0, a) {
  let d = `M0,${y0}`
  for (let x = 0; x < 2400; x += 800) {
    d += ` C${x + 200},${y0 - a} ${x + 300},${y0 - a} ${x + 400},${y0} C${x + 500},${y0 + a} ${x + 600},${y0 + a} ${x + 800},${y0}`
  }
  return `${d} L2400,${h} L0,${h} Z`
}

// Brand dot matrix wave. Two layers drift at different speeds unless `single`.
export function DotWave({ className = 'bottom-0 h-64 sm:h-80', color = '#FFFFFF', single = false, front = 'drift' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg aria-hidden="true" viewBox="0 0 1600 340" preserveAspectRatio="xMidYMax slice" className={`pointer-events-none absolute inset-x-0 w-full ${className}`}>
      <defs>
        <pattern id={`${id}a`} width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.7" fill={color} /></pattern>
        <pattern id={`${id}b`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.3" fill={color} /></pattern>
      </defs>
      {!single && <g className="drift-slow" opacity=".4"><path fill={`url(#${id}b)`} d={wavePath(340, 150, 75)} /></g>}
      <g className={front}><path fill={`url(#${id}a)`} d={wavePath(340, 200, 80)} /></g>
    </svg>
  )
}

const PIXELS = [[5, 0], [4, 1], [5, 1], [3, 2], [4, 2], [5, 2], [2, 3], [3, 3], [5, 3], [1, 4], [3, 4], [4, 4], [0, 5], [2, 5]]

export function PixelCluster({ className = 'w-24 h-24', float = 'float' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 6 6" className={`pointer-events-none absolute hidden lg:block ${float} ${className}`}>
      {PIXELS.map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width=".8" height=".8" />)}
      <rect x="5" y="5" width=".8" height=".8" fill="#C6FF4D" />
    </svg>
  )
}
