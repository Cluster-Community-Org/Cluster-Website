// CLUSTER Society Data Service
// Manages local state persistence, reactive event dispatching, and fallback mock data.

const STORAGE_KEYS = {
  EVENTS: 'cluster_cms_events',
  SPOTLIGHT_ID: 'cluster_cms_spotlight_id',
  TEAM: 'cluster_cms_team',
  APPLICATIONS: 'cluster_cms_applications',
  HOMEPAGE: 'cluster_cms_homepage_config',
}

// ── Default Seed Data ────────────────────────────────────────────────────────

const DEFAULT_EVENTS = [
  {
    id: 1,
    slug: 'cluster-hackathon-s1',
    title: 'CLUSTER Hackathon Season 1',
    date: '2026-12-05',
    time: '09:00 AM IST',
    location: 'C-Block Auditorium, Galgotias University',
    type: 'hackathon',
    summary: 'The flagship 24-hour build sprint. Multidisciplinary student teams tackle high-impact briefs across Web3, AI, and developer tools. ₹2,50,000 prize pool with industry mentorship.',
    registrationUrl: 'https://galgotiasuniversity.edu.in',
    isSpotlight: true,
    featured: true,
  },
  {
    id: 2,
    slug: 'full-stack-bootcamp',
    title: 'Full-Stack Web Dev Bootcamp',
    date: '2026-11-20',
    time: '10:00 AM IST',
    location: 'Room 301, CS Building',
    type: 'workshop',
    summary: 'Hands-on full-stack workshop: React, Tailwind CSS, Node.js, and deploying to production. From zero to a shipped project in two days.',
    registrationUrl: 'https://galgotiasuniversity.edu.in',
    isSpotlight: false,
    featured: true,
  },
  {
    id: 3,
    slug: 'ai-study-circle',
    title: 'AI & ML Weekly Study Circle',
    date: '2026-11-15',
    time: '05:00 PM IST',
    location: 'Lab Block A, Room 204',
    type: 'study',
    summary: 'Peer-led weekly sessions exploring ML fundamentals through to fine-tuning LLMs. No prior AI experience needed — just curiosity.',
    registrationUrl: 'https://galgotiasuniversity.edu.in',
    isSpotlight: false,
    featured: false,
  },
  {
    id: 4,
    slug: 'intro-to-open-source',
    title: 'Introduction to Open Source Contribution',
    date: '2026-05-10',
    time: '11:00 AM IST',
    location: 'Computer Lab Block A',
    type: 'workshop',
    summary: 'First open-source contribution workshop: Git, GitHub, PRs, issue triage, and contributing to real projects in a safe, guided environment.',
    registrationUrl: 'https://galgotiasuniversity.edu.in',
    isSpotlight: false,
    featured: false,
  },
]

const DEFAULT_HOMEPAGE = {
  bannerEnabled: true,
  bannerText: '⚡ Registrations are now open for CLUSTER Hackathon Season 1! Join 300+ student builders.',
  bannerLink: '/events',
  bannerLinkText: 'Learn More →',
  stats: [
    { label: 'MEMBERS', value: '150+' },
    { label: 'EVENTS HOSTED', value: '20+' },
    { label: 'PROJECTS BUILT', value: '10+' },
    { label: 'INDUSTRY PARTNERS', value: '5+' },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function dispatchUpdate(eventType, data) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }))
  }
}

// ── Data API ─────────────────────────────────────────────────────────────────

export const clusterDataService = {
  // ── Events Management ──
  getEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS)
      if (stored) return JSON.parse(stored)
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS))
      return DEFAULT_EVENTS
    } catch {
      return DEFAULT_EVENTS
    }
  },

  saveEvent(eventData) {
    const current = this.getEvents()
    let updated
    if (eventData.id) {
      updated = current.map((e) => (e.id === eventData.id ? { ...e, ...eventData } : e))
    } else {
      const newEvent = {
        ...eventData,
        id: Date.now(),
        slug: eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }
      updated = [newEvent, ...current]
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated))
    dispatchUpdate('cluster_events_updated', updated)
    return updated
  },

  deleteEvent(id) {
    const current = this.getEvents()
    const updated = current.filter((e) => e.id !== id)
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated))

    // If the deleted event was the spotlight, reassign to the first available event
    const spotlight = this.getSpotlightEvent()
    if (spotlight && spotlight.id === id) {
      if (updated.length > 0) {
        this.setSpotlightEvent(updated[0].id)
      } else {
        localStorage.removeItem(STORAGE_KEYS.SPOTLIGHT_ID)
        dispatchUpdate('cluster_spotlight_updated', null)
      }
    }

    dispatchUpdate('cluster_events_updated', updated)
    return updated
  },

  // ── Spotlight System ──
  getSpotlightEvent() {
    const events = this.getEvents()
    // First check localStorage explicit spotlight ID
    const explicitId = localStorage.getItem(STORAGE_KEYS.SPOTLIGHT_ID)
    if (explicitId) {
      const found = events.find((e) => String(e.id) === String(explicitId))
      if (found) return found
    }

    // Next check event with isSpotlight === true
    const marked = events.find((e) => e.isSpotlight)
    if (marked) return marked

    // Fallback to first event
    return events[0] || null
  },

  setSpotlightEvent(id) {
    const events = this.getEvents()
    const updated = events.map((e) => ({
      ...e,
      isSpotlight: e.id === id,
    }))
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEYS.SPOTLIGHT_ID, String(id))

    const activeSpotlight = updated.find((e) => e.id === id) || null
    dispatchUpdate('cluster_spotlight_updated', activeSpotlight)
    dispatchUpdate('cluster_events_updated', updated)
    return activeSpotlight
  },

  // ── Homepage Config ──
  getHomepageConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOMEPAGE)
      if (stored) return JSON.parse(stored)
      localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(DEFAULT_HOMEPAGE))
      return DEFAULT_HOMEPAGE
    } catch {
      return DEFAULT_HOMEPAGE
    }
  },

  updateHomepageConfig(partial) {
    const current = this.getHomepageConfig()
    const updated = { ...current, ...partial }
    localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(updated))
    dispatchUpdate('cluster_homepage_updated', updated)
    return updated
  },
}

