import { DotWave, FullStop } from '../ui/Brand.jsx'

const WORDS = 'Good things happen in clusters. Every project worth talking about on campus started with a few people who found each other'.split(' ')

// Words light up with scroll (CSS view timeline).
export default function TaglineSection() {
  return (
    <section aria-label="Tagline" className="relative overflow-hidden px-6 py-24 sm:py-40 flex justify-center">
      <DotWave className="bottom-0 h-full opacity-[.13]" color="#000000" single front="drift-lazy" />

      <p data-build className="tagline relative max-w-[980px] text-center heading-1 sm:leading-[1.15]">
        {WORDS.map((w, i) => (
          <span key={i}>
            <span className="tagline-word" style={{ '--i': i }}>{w}{i === WORDS.length - 1 && <FullStop />}</span>{' '}
          </span>
        ))}
      </p>
    </section>
  )
}
