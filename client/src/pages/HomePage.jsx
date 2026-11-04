import { useState, useEffect } from 'react'
import HeroSection from '../components/sections/HeroSection.jsx'
import AboutSection from '../components/sections/AboutSection.jsx'
import FeaturedSection from '../components/sections/FeaturedSection.jsx'
import CommunitiesSection from '../components/sections/CommunitiesSection.jsx'
import JoinCTA from '../components/sections/JoinCTA.jsx'
import { EventCountdown } from '../components/sections/EventCountdown.jsx'
import { clusterDataService } from '../services/clusterDataService.js'

export default function HomePage() {
  const [spotlightEvent, setSpotlightEvent] = useState(() => clusterDataService.getSpotlightEvent())

  useEffect(() => {
    setSpotlightEvent(clusterDataService.getSpotlightEvent())

    const handleSpotlightUpdate = (e) => {
      if (e.detail) {
        setSpotlightEvent(e.detail)
      } else {
        setSpotlightEvent(clusterDataService.getSpotlightEvent())
      }
    }

    const handleEventsUpdate = () => {
      setSpotlightEvent(clusterDataService.getSpotlightEvent())
    }

    window.addEventListener('cluster_spotlight_updated', handleSpotlightUpdate)
    window.addEventListener('cluster_events_updated', handleEventsUpdate)

    return () => {
      window.removeEventListener('cluster_spotlight_updated', handleSpotlightUpdate)
      window.removeEventListener('cluster_events_updated', handleEventsUpdate)
    }
  }, [])

  return (
    <>
      {/* 1. Hero Section with Circuit Canvas Micro-animation & 4 Core Metric Cards */}
      <HeroSection />

      {/* 2. About / Four Pillars Section */}
      <AboutSection />

      {/* 3. Spotlight Event with Live Countdown Timer */}
      {spotlightEvent && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EventCountdown event={spotlightEvent} />
        </section>
      )}

      {/* 4. Featured Section (Projects & Events) */}
      <FeaturedSection />

      {/* 5. Student-Led CLUSTER Communities */}
      <CommunitiesSection />

      {/* 6. Join Membership Banner */}
      <JoinCTA />
    </>
  )
}
