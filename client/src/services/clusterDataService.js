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
    slug: 'kickstart-26',
    title: 'Kickstart \'26 — Community Meetup',
    date: '2026-12-05',
    time: '05:00 PM IST',
    location: 'On Campus Auditorium',
    type: 'meetup',
    summary: 'A community meetup for tech students who care about compute. Meet fellow builders, explore project showcases, discover open collaboration, and find out what\'s next at CLUSTER.',
    registrationUrl: 'https://github.com/alwin2134/Cluster',
    isSpotlight: true,
    featured: true,
  },
  {
    id: 2,
    slug: 'cluster-hackathon-s1',
    title: 'CLUSTER Hackathon Season 1',
    date: '2026-12-15',
    time: '09:00 AM IST',
    location: 'C-Block Auditorium',
    type: 'hackathon',
    summary: 'The flagship 24-hour build sprint. Multidisciplinary student teams tackle high-impact briefs across Web3, AI, and developer tools. ₹2,50,000 prize pool with industry mentorship.',
    registrationUrl: 'https://github.com/alwin2134/Cluster',
    isSpotlight: false,
    featured: true,
  },
  {
    id: 3,
    slug: 'full-stack-bootcamp',
    title: 'Full-Stack Web Dev Bootcamp',
    date: '2026-11-20',
    time: '10:00 AM IST',
    location: 'Room 301, CS Building',
    type: 'workshop',
    summary: 'Hands-on full-stack workshop: React, Tailwind CSS, Node.js, and deploying to production. From zero to a shipped project in two days.',
    registrationUrl: 'https://github.com/alwin2134/Cluster',
    isSpotlight: false,
    featured: true,
  },
  {
    id: 4,
    slug: 'ai-study-circle',
    title: 'AI & ML Weekly Study Circle',
    date: '2026-11-15',
    time: '05:00 PM IST',
    location: 'Lab Block A, Room 204',
    type: 'study',
    summary: 'Peer-led weekly sessions exploring ML fundamentals through to fine-tuning LLMs. No prior AI experience needed — just curiosity.',
    registrationUrl: 'https://github.com/alwin2134/Cluster',
    isSpotlight: false,
    featured: false,
  },
]

const DEFAULT_HOMEPAGE = {
  bannerEnabled: true,
  bannerText: '⚡ Good things happen in clusters. Kickstart \'26 registrations are now open for tech students.',
  bannerLink: '/events',
  bannerLinkText: 'Join In →',
  stats: [
    { label: 'MEMBERS', value: '150+' },
    { label: 'EVENTS HOSTED', value: '20+' },
    { label: 'PROJECTS BUILT', value: '10+' },
    { label: 'COMMUNITY CIRCLES', value: '4+' },
  ],
}

const DEFAULT_TEAM = [
  {
    id: 1,
    name: 'President',
    role: 'Club Founder & President',
    graduationYear: '2026',
    bio: 'Founded CLUSTER to build a student technology community. Passionate about open-source software, developer communities, and making compute accessible to everyone.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'PR',
  },
  {
    id: 2,
    name: 'Vice President',
    role: 'AI & Research Lead',
    graduationYear: '2026',
    bio: 'Leads the AI & ML study circle and research projects. Specializes in building machine learning pipelines and mentoring members from beginner to practitioner level.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'VP',
  },
  {
    id: 3,
    name: 'Technical Secretary',
    role: 'Engineering & Dev Lead',
    graduationYear: '2027',
    bio: 'Heads the Developer Circle — organizing hackathons, code sprints, and open-source contribution sessions. Expert in full-stack development and system design.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'TS',
  },
  {
    id: 4,
    name: 'Events Director',
    role: 'Events & Community Coordinator',
    graduationYear: '2027',
    bio: 'Organizes workshops, competitions, and community events that bring CLUSTER members together. Coordinates partnerships with external organizations and sponsors.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'ED',
  },
]

const DEFAULT_APPLICATIONS = [
  {
    id: 'app-1',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    rollNumber: '22SCSE101001',
    branchYear: 'CSE / 3rd Year',
    domain: 'AI & Machine Learning',
    github: 'https://github.com/aaravs',
    linkedin: 'https://linkedin.com/in/aaravs',
    motivation: 'Passionate about distributed training and GPU accelerated inference. Want to build open source ML pipelines with the Compute circle.',
    status: 'Under Review',
    submittedAt: '2026-11-01T14:30:00Z',
  },
  {
    id: 'app-2',
    fullName: 'Diya Patel',
    email: 'diya.patel@example.com',
    rollNumber: '23SCSE102045',
    branchYear: 'CSE / 2nd Year',
    domain: 'Full-Stack Web Dev',
    github: 'https://github.com/diyapatel',
    linkedin: 'https://linkedin.com/in/diyap',
    motivation: 'Built multiple React & Node.js projects. Eager to contribute to the CLUSTER web applications and organize full-stack sprints.',
    status: 'Accepted',
    submittedAt: '2026-10-28T09:15:00Z',
  },
  {
    id: 'app-3',
    fullName: 'Rohan Verma',
    email: 'rohan.v@example.com',
    rollNumber: '24SCSE103112',
    branchYear: 'IT / 1st Year',
    domain: 'Open Source & Dev Tools',
    github: 'https://github.com/rohanverma',
    linkedin: '',
    motivation: 'Curious first-year student eager to learn from seniors, attend the hackathon, and collaborate on systems programming.',
    status: 'Pending',
    submittedAt: '2026-11-03T11:00:00Z',
  },
]

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

  // ── Team Management ──
  getTeamMembers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEAM)
      if (stored) return JSON.parse(stored)
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(DEFAULT_TEAM))
      return DEFAULT_TEAM
    } catch {
      return DEFAULT_TEAM
    }
  },

  saveTeamMember(memberData) {
    const current = this.getTeamMembers()
    let updated
    if (memberData.id) {
      updated = current.map((m) => (m.id === memberData.id ? { ...m, ...memberData } : m))
    } else {
      const initials = memberData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CL'
      const newMember = {
        ...memberData,
        id: Date.now(),
        initials,
      }
      updated = [...current, newMember]
    }
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated))
    dispatchUpdate('cluster_team_updated', updated)
    return updated
  },

  deleteTeamMember(id) {
    const current = this.getTeamMembers()
    const updated = current.filter((m) => m.id !== id)
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated))
    dispatchUpdate('cluster_team_updated', updated)
    return updated
  },

  // ── Membership Applications (Recruitment) ──
  getApplications() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
      if (stored) return JSON.parse(stored)
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATIONS))
      return DEFAULT_APPLICATIONS
    } catch {
      return DEFAULT_APPLICATIONS
    }
  },

  addApplication(appData) {
    const current = this.getApplications()
    const newApp = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    }
    const updated = [newApp, ...current]
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated))
    dispatchUpdate('cluster_applications_updated', updated)
    return newApp
  },

  updateApplicationStatus(id, newStatus) {
    const current = this.getApplications()
    const updated = current.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated))
    dispatchUpdate('cluster_applications_updated', updated)
    return updated
  },

  deleteApplication(id) {
    const current = this.getApplications()
    const updated = current.filter((app) => app.id !== id)
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated))
    dispatchUpdate('cluster_applications_updated', updated)
    return updated
  },

  exportApplicationsCSV() {
    const apps = this.getApplications()
    const headers = ['ID', 'Full Name', 'Email', 'Roll Number', 'Branch & Year', 'Domain', 'Status', 'Submitted At', 'GitHub', 'LinkedIn', 'Motivation']
    const rows = apps.map((a) => [
      a.id,
      `"${(a.fullName || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.rollNumber || '').replace(/"/g, '""')}"`,
      `"${(a.branchYear || '').replace(/"/g, '""')}"`,
      `"${(a.domain || '').replace(/"/g, '""')}"`,
      `"${(a.status || '').replace(/"/g, '""')}"`,
      `"${a.submittedAt || ''}"`,
      `"${(a.github || '').replace(/"/g, '""')}"`,
      `"${(a.linkedin || '').replace(/"/g, '""')}"`,
      `"${(a.motivation || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `cluster_applications_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
}

