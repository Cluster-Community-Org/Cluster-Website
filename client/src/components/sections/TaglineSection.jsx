import { DotWave, Square } from '../ui/Brand.jsx'

const WORDS = 'Good things happen in clusters. Every project worth talking about on campus started with a few people who found each other.'.split(' ')
const NODES = [[120, 140], [260, 90], [160, 470], [560, 548], [1140, 540], [1320, 140], [1380, 420]]
const PATH = 'M' + NODES.map(([x, y]) => `${x},${y}`).join(' L')

// Words light up with scroll (CSS view timeline); the connection path keeps moving at rest.
export default function TaglineSection() {
  return (
    <section aria-label="Tagline" className="relative overflow-hidden px-6 py-24 sm:py-40 flex justify-center">
      <DotWave className="bottom-0 h-full opacity-[.13]" color="#000000" single front="drift-lazy" />
      <svg aria-hidden="true" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 w-full h-full">
        <path id="tagline-path" d={PATH} fill="none" stroke="#000" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" opacity=".35" />
        {NODES.map(([x, y], i) => (
          <rect key={i} className="node" x={x - 5} y={y - 5} width="10" height="10" style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
        {[[14, '0s'], [8, '-0.6s']].map(([s, begin]) => (
          <rect key={s} className="travel" x={-s / 2} y={-s / 2} width={s} height={s} fill="#C6FF4D" opacity={s === 8 ? 0.5 : 1}>
            <animateMotion dur="16s" begin={begin} repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keyPoints="0;1" keySplines="0.22 1 0.36 1">
              <mpath href="#tagline-path" />
            </animateMotion>
          </rect>
        ))}
      </svg>

      <p className="tagline relative max-w-[980px] text-center heading-1 sm:leading-[1.15]">
        {WORDS.map((w, i) => (
          <span key={i}>
            <span className="tagline-word" style={{ '--i': i }}>{w}</span>{' '}
          </span>
        ))}
        <Square className="w-3 h-3 sm:w-4 sm:h-4" pulse />
      </p>
    </section>
  )
}
