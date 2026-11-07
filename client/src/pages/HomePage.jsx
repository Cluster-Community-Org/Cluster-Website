import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import HeroSection from '../components/sections/HeroSection.jsx'
import TaglineSection from '../components/sections/TaglineSection.jsx'
import WhyJoinSection from '../components/sections/WhyJoinSection.jsx'
import CirclesSection from '../components/sections/CirclesSection.jsx'
import HowItWorksSection from '../components/sections/HowItWorksSection.jsx'
import SpotlightSection from '../components/sections/SpotlightSection.jsx'
import { ClusterMark, Corners, DotWave, Eyebrow, FullStop, PixelCluster, Square } from '../components/ui/Brand.jsx'
import { clusterDataService } from '../services/clusterDataService.js'
import { useLive } from '../hooks/useLive.js'

const VALUES = ['Community', 'Collaboration', 'Belonging', 'Shared curiosity', 'Good things happen in clusters.']

const FAQ = [
  ['Do I need to know how to code?', 'Not necessarily. We select on what you have done, not on how polished it is: a class project you took further, a hackathon entry, a script that saved you an hour. Show us that, and the developer circle takes it from there.'],
  ['Which branches and years can apply?', 'Any. Every tech student is welcome, whatever your branch or graduation year.'],
  ['What should I put in my application?', 'Links to anything you have built, broken or shipped: repos, hackathon entries, open source PRs, class projects you extended. A short note on what each one was is enough. Rough is fine.'],
  ['How are members selected?', 'Circle leads read every application. Shortlisted applicants get an informal chat, on campus or online, and then a place in the circle that fits what they showed us.'],
  ['Applications are closed. Can I still take part?', 'Yes. Hackathons, open workshops, study circles and meetups stay open to every student all year. Check the events page.'],
  ['What happens after I am accepted?', 'You get placed in a circle with a mentor, join a project team, and demo what you built at the next showcase.'],
]

function ValuesMarquee() {
  const row = (hidden) => (
    <div aria-hidden={hidden || undefined} className="flex items-center gap-10 pr-10 whitespace-nowrap">
      {VALUES.map((v) => (
        <span key={v} className="flex items-center gap-10">
          <span className="title-2">{v}</span>
          <Square className="w-2 h-2" />
        </span>
      ))}
    </div>
  )
  return (
    <section aria-label="Our values" className="pt-8 overflow-hidden">
      <div className="border-y border-line py-4 overflow-hidden">
        <div className="marquee flex w-max">{row(false)}{row(true)}</div>
      </div>
    </section>
  )
}

function FaqItem({ q, a, startOpen }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <div className="border-b border-line">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="title-2 w-full flex cursor-pointer items-center justify-between gap-6 py-6 text-left [--press:.99]">
        {q}
        <Plus aria-hidden="true" className={`w-5 h-5 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'rotate-45' : ''}`} />
      </button>
      <div inert={!open} className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="body-3 text-graphite pb-6 pr-12">{a}</p>
        </div>
      </div>
    </div>
  )
}

function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="relative px-4 sm:px-8 lg:px-20 pb-32">
      <PixelCluster className="w-16 h-16 left-20 top-80" />
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="reveal flex flex-col gap-4 max-w-md">
          <Eyebrow>Questions</Eyebrow>
          <h2 id="faq-heading" className="heading-2">Things people ask<br />before they apply</h2>
          <p className="body-3 text-graphite">Still unsure? Come to the next open event. No application needed for that.</p>
        </div>
        <div className="reveal reveal-2 border-t border-line">
          {FAQ.map(([q, a], i) => <FaqItem key={q} q={q} a={a} startOpen={i === 0} />)}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  const open = useLive('cluster_homepage_updated', () => clusterDataService.isApplicationsOpen())
  return (
    <section id="join" aria-labelledby="cta-heading" className="px-2 sm:px-4">
      <div className="relative overflow-hidden rounded-3xl bg-black text-white px-6 py-24 sm:px-20 sm:py-32 flex flex-col items-center text-center gap-8">
        <DotWave className="bottom-0 h-72 opacity-60" single />
        <Corners inset="top-6 left-6 right-6 bottom-6" />
        <ClusterMark className="relative w-16 h-16 sm:w-20 sm:h-20 text-white" animated />
        <h2 id="cta-heading" className="reveal relative heading-1 max-w-[680px]">
          Good things happen<br />in clusters<FullStop />
        </h2>
        <p className="reveal reveal-2 relative title-2 text-soft max-w-xl">
          {open
            ? "Applications for this round are open. Show us what you've built. We'll show you who to build with next."
            : 'Applications are closed for this round. Events stay open to every student.'}
        </p>
        <Link to={open ? '/join' : '/events'} className="reveal reveal-3 relative btn btn-lime min-h-12 text-lg px-6">
          {open ? 'Apply to join Cluster' : 'See upcoming events'} <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="relative caption-3 text-mute flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
          <span>Any branch, any year</span><Square className="w-1.5 h-1.5" /><span>Selected on what you&apos;ve built</span>
        </p>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValuesMarquee />
      <TaglineSection />
      <WhyJoinSection />
      <CirclesSection />
      <HowItWorksSection />
      <SpotlightSection />
      <FaqSection />
      <FinalCta />
    </>
  )
}
