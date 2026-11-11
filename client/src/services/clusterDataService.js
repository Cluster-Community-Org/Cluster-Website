// CLUSTER Society Data Service
// Manages local state persistence, reactive event dispatching, Supabase cloud sync, and fallback mock data.
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const STORAGE_KEYS = {
  EVENTS: 'cluster_cms_events',
  SPOTLIGHT_ID: 'cluster_cms_spotlight_id',
  TEAM: 'cluster_cms_team',
  APPLICATIONS: 'cluster_cms_applications',
  HOMEPAGE: 'cluster_cms_homepage_config',
  AUDIT_LOG: 'cluster_cms_audit_log',
  SOCIALS: 'cluster_cms_social_links',
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
    registrationUrl: 'https://github.com/Cluster-Community-Org',
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
    registrationUrl: 'https://github.com/Cluster-Community-Org',
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
    registrationUrl: 'https://github.com/Cluster-Community-Org',
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
    registrationUrl: 'https://github.com/Cluster-Community-Org',
    isSpotlight: false,
    featured: false,
  },
]

const DEFAULT_HOMEPAGE = {
  bannerEnabled: true,
  bannerText: 'Kickstart \'26 registrations are open for tech students.',
  bannerLink: '/events',
  bannerLinkText: 'See events',
  heroHeadline: 'Find your people.\nBuild together.',
  heroSubtitle: 'A student community around compute.',
  statsEnabled: false,
  applicationsSheetUrl: '',
  applicationsOpen: true,
  stats: [
    { label: 'COMMUNITY MEMBERS', value: '150+' },
    { label: 'EVENTS & SESSIONS', value: '20+' },
    { label: 'SHIPPED PROJECTS', value: '10+' },
    { label: 'OPEN COLLABORATION', value: '100%' },
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
    course: 'B.Tech',
    branch: 'Computer Science & Engineering (CSE)',
    year: '3rd Year',
    branchYear: 'B.Tech · CSE · 3rd Year',
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
    course: 'B.Tech',
    branch: 'Computer Science & Engineering (CSE)',
    year: '2nd Year',
    branchYear: 'B.Tech · CSE · 2nd Year',
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
    course: 'B.Tech',
    branch: 'Information Technology (IT)',
    year: '1st Year',
    branchYear: 'B.Tech · IT · 1st Year',
    domain: 'Open Source & Dev Tools',
    github: 'https://github.com/rohanverma',
    linkedin: '',
    motivation: 'Curious first-year student eager to learn from seniors, attend the hackathon, and collaborate on systems programming.',
    status: 'Pending',
    submittedAt: '2026-11-03T11:00:00Z',
  },
]

export const DEFAULT_SOCIAL_LINKS = [
  {
    id: 'website',
    title: 'Official Website',
    subtitle: 'Explore our DGX H200 cluster, circles & projects',
    url: 'https://clustersociety.tech',
    iconType: 'globe',
    bgClass: 'bg-[#C6FF4D] text-black border-2 border-black hover:bg-[#b5f533]',
    enabled: true,
    isHighlighted: true,
    category: 'Featured',
    order: 1,
  },
  {
    id: 'join',
    title: 'Apply for Membership (Recruitment 2026)',
    subtitle: 'Join the Compute, Applied AI, or Crew circles',
    url: 'https://clustersociety.tech/join',
    iconType: 'rocket',
    bgClass: 'bg-[#76B900] text-black border-2 border-black hover:bg-[#68a500]',
    enabled: true,
    isHighlighted: true,
    badge: 'Open Now',
    category: 'Featured',
    order: 2,
  },
  {
    id: 'events',
    title: 'Upcoming Events & Hackathons',
    subtitle: 'Register for DGX workshops, hackathons & meetups',
    url: 'https://clustersociety.tech/events',
    iconType: 'calendar',
    bgClass: 'bg-[#6366F1] text-white border-2 border-black hover:bg-[#5254d8]',
    enabled: true,
    category: 'Community',
    order: 3,
  },
  {
    id: 'discord',
    title: 'Join our Discord Server',
    subtitle: 'Chat with GPU developers, AI researchers & builders',
    url: 'https://discord.gg/clustersociety',
    iconType: 'discord',
    bgClass: 'bg-[#5865F2] text-white border-2 border-black hover:bg-[#4752c4]',
    enabled: true,
    category: 'Community',
    order: 4,
  },
  {
    id: 'whatsapp',
    title: 'Join our WhatsApp Community',
    subtitle: 'Instant announcements, event updates & reminders',
    url: 'https://chat.whatsapp.com/clustersociety',
    iconType: 'whatsapp',
    bgClass: 'bg-[#25D366] text-white border-2 border-black hover:bg-[#20b858]',
    enabled: true,
    category: 'Community',
    order: 5,
  },
  {
    id: 'linkedin',
    title: 'Connect with us on LinkedIn',
    subtitle: 'Industry collaborations, guest lectures & milestones',
    url: 'https://www.linkedin.com/company/cluster-club-gu/',
    iconType: 'linkedin',
    bgClass: 'bg-[#0A66C2] text-white border-2 border-black hover:bg-[#084e96]',
    enabled: true,
    category: 'Socials',
    order: 6,
  },
  {
    id: 'instagram',
    title: 'Follow us on Instagram',
    subtitle: '@theclustercommunity — event recaps, reels & stories',
    url: 'https://www.instagram.com/theclustercommunity',
    iconType: 'instagram',
    bgClass: 'bg-[#E4405F] text-white border-2 border-black hover:bg-[#d63251]',
    enabled: true,
    category: 'Socials',
    order: 7,
  },
  {
    id: 'x',
    title: 'Follow us on X (Twitter)',
    subtitle: '@the_clusterclub — GPU benchmarks, tech drops & news',
    url: 'https://x.com/the_clusterclub',
    iconType: 'x',
    bgClass: 'bg-[#000000] text-white border-2 border-white/20 hover:bg-[#181818]',
    enabled: true,
    category: 'Socials',
    order: 8,
  },
  {
    id: 'github',
    title: 'Explore GitHub Repositories',
    subtitle: 'Cluster-Community-Org — open source projects & models',
    url: 'https://github.com/Cluster-Community-Org',
    iconType: 'github',
    bgClass: 'bg-[#24292E] text-white border-2 border-black hover:bg-[#1a1e22]',
    enabled: true,
    category: 'Developer',
    order: 9,
  },
  {
    id: 'team',
    title: 'Meet the Circles & Core Team',
    subtitle: 'The student leads and mentors behind CLUSTER',
    url: 'https://clustersociety.tech/team',
    iconType: 'users',
    bgClass: 'bg-[#0EA5E9] text-white border-2 border-black hover:bg-[#0284c7]',
    enabled: true,
    category: 'Community',
    order: 10,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function dispatchUpdate(eventType, data) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }))
  }
}

// ── Supabase Field Mappers ──
function eventFromDB(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
    type: row.type,
    summary: row.summary,
    registrationUrl: row.registration_url,
    isSpotlight: Boolean(row.is_spotlight),
    featured: Boolean(row.featured),
  }
}

function eventToDB(e) {
  return {
    slug: e.slug || e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: e.title,
    date: e.date,
    time: e.time || '10:00 AM IST',
    location: e.location,
    type: e.type || 'workshop',
    summary: e.summary || '',
    registration_url: e.registrationUrl || 'https://github.com/Cluster-Community-Org',
    is_spotlight: Boolean(e.isSpotlight),
    featured: Boolean(e.featured),
  }
}

function appFromDB(row) {
  if (!row) return null
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    rollNumber: row.roll_number,
    course: row.course || '',
    branch: row.branch || '',
    year: row.year || '',
    branchYear: row.branch_year || [row.course, row.branch, row.year].filter(Boolean).join(' · '),
    domain: row.domain,
    github: row.github,
    linkedin: row.linkedin,
    projects: row.projects || '',
    motivation: row.motivation,
    status: row.status,
    submittedAt: row.submitted_at,
  }
}

function appToDB(a) {
  const branchYear = a.branchYear || [a.course, a.branch, a.year].filter(Boolean).join(' · ')
  return {
    id: a.id,
    full_name: a.fullName,
    email: a.email,
    roll_number: a.rollNumber,
    course: a.course || '',
    branch: a.branch || '',
    year: a.year || '',
    branch_year: branchYear,
    domain: a.domain,
    github: a.github || '',
    linkedin: a.linkedin || '',
    projects: a.projects || '',
    motivation: a.motivation || '',
    status: a.status || 'Pending',
  }
}

function memberFromDB(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    graduationYear: row.graduation_year,
    bio: row.bio,
    github: row.github,
    linkedin: row.linkedin,
    initials: row.initials,
  }
}

function memberToDB(m) {
  return {
    name: m.name,
    role: m.role,
    graduation_year: m.graduationYear || '2026',
    bio: m.bio || '',
    github: m.github || '',
    linkedin: m.linkedin || '',
    initials: m.initials,
  }
}

function socialLinkFromDB(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    url: row.url,
    iconType: row.icon_type || 'globe',
    bgClass: row.bg_class || 'bg-[#C6FF4D] text-black border-2 border-black hover:bg-[#b5f533]',
    badge: row.badge || '',
    category: row.category || 'General',
    enabled: row.enabled !== undefined ? Boolean(row.enabled) : true,
    isHighlighted: Boolean(row.is_highlighted),
    order: row.sort_order !== undefined ? Number(row.sort_order) : 0,
  }
}

function socialLinkToDB(link, index = 0) {
  return {
    id: link.id,
    title: link.title,
    subtitle: link.subtitle || '',
    url: link.url,
    icon_type: link.iconType || 'globe',
    bg_class: link.bgClass || '',
    badge: link.badge || '',
    category: link.category || 'General',
    enabled: link.enabled !== undefined ? Boolean(link.enabled) : true,
    is_highlighted: Boolean(link.isHighlighted),
    sort_order: link.order !== undefined ? Number(link.order) : index,
    updated_at: new Date().toISOString(),
  }
}

function configFromDB(row) {
  if (!row) return null
  let localConfig = {}
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HOMEPAGE)
    if (stored) localConfig = JSON.parse(stored)
  } catch {}

  let dbSocials = null
  if (row.social_links && Array.isArray(row.social_links) && row.social_links.length > 0) {
    dbSocials = row.social_links
  } else if (Array.isArray(row.stats)) {
    const metaItem = row.stats.find((s) => s && s.__type === 'cluster_social_links')
    if (metaItem && Array.isArray(metaItem.links) && metaItem.links.length > 0) {
      dbSocials = metaItem.links
    }
  }

  if (dbSocials) {
    try {
      localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(dbSocials))
      dispatchUpdate('cluster_socials_updated', dbSocials)
    } catch {}
  }

  const rawStats = Array.isArray(row.stats) ? row.stats : (localConfig.stats || [])
  const cleanStats = rawStats.filter((s) => !s || s.__type !== 'cluster_social_links')

  return {
    bannerEnabled: Boolean(row.banner_enabled),
    bannerText: row.banner_text,
    bannerLink: row.banner_link,
    bannerLinkText: row.banner_link_text,
    heroHeadline: row.hero_headline,
    heroSubtitle: row.hero_subtitle,
    statsEnabled: row.stats_enabled !== undefined ? Boolean(row.stats_enabled) : (localConfig.statsEnabled !== undefined ? Boolean(localConfig.statsEnabled) : false),
    applicationsSheetUrl: row.applications_sheet_url !== undefined ? row.applications_sheet_url : (localConfig.applicationsSheetUrl || ''),
    applicationsOpen: row.applications_open !== undefined ? Boolean(row.applications_open) : (localConfig.applicationsOpen !== undefined ? Boolean(localConfig.applicationsOpen) : true),
    stats: cleanStats,
  }
}

function configToDB(c) {
  let socials = null
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SOCIALS)
    if (stored) socials = JSON.parse(stored)
  } catch {}

  const rawStats = Array.isArray(c.stats) ? c.stats : []
  const cleanStats = rawStats.filter((s) => !s || s.__type !== 'cluster_social_links')
  if (socials && Array.isArray(socials)) {
    cleanStats.push({ __type: 'cluster_social_links', links: socials })
  }

  const payload = {
    id: 1,
    banner_enabled: Boolean(c.bannerEnabled),
    banner_text: c.bannerText,
    banner_link: c.bannerLink,
    banner_link_text: c.bannerLinkText,
    hero_headline: c.heroHeadline,
    hero_subtitle: c.heroSubtitle,
    stats_enabled: Boolean(c.statsEnabled),
    applications_sheet_url: (c.applicationsSheetUrl || '').trim(),
    applications_open: c.applicationsOpen !== undefined ? Boolean(c.applicationsOpen) : true,
    stats: cleanStats,
    updated_at: new Date().toISOString(),
  }

  if (socials && Array.isArray(socials)) {
    payload.social_links = socials
  }

  return payload
}

// ── Data API ─────────────────────────────────────────────────────────────────

const DEFAULT_AUDIT_LOG = [
  {
    id: 'log-1',
    action: 'SPOTLIGHT_UPDATED',
    summary: 'Spotlight promoted to "Kickstart \'26 — Community Meetup"',
    timestamp: '2026-11-03T18:00:00Z',
    category: 'events',
  },
  {
    id: 'log-2',
    action: 'APPLICATION_RECEIVED',
    summary: 'New applicant logged: Aarav Sharma (AI & Machine Learning)',
    timestamp: '2026-11-03T16:45:00Z',
    category: 'applications',
  },
  {
    id: 'log-3',
    action: 'HOMEPAGE_SYNC',
    summary: 'Announcement ticker updated with Kickstart \'26 registration',
    timestamp: '2026-11-03T14:15:00Z',
    category: 'homepage',
  },
  {
    id: 'log-4',
    action: 'TEAM_ROSTER_SYNC',
    summary: 'Executive board profiles verified for 2026-2027 session',
    timestamp: '2026-11-02T11:00:00Z',
    category: 'team',
  },
]

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
    this.logAudit(eventData.id ? 'EVENT_UPDATED' : 'EVENT_CREATED', `Event "${eventData.title}" ${eventData.id ? 'updated' : 'published'}`, 'events')
    dispatchUpdate('cluster_events_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      const payload = eventToDB(eventData)
      supabase.from('events').upsert(payload, { onConflict: 'slug' }).then(({ error }) => {
        if (error) console.warn('[Supabase Sync Error] events.upsert:', error.message)
      })
    }

    return updated
  },

  deleteEvent(id) {
    const current = this.getEvents()
    const target = current.find((e) => e.id === id)
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

    this.logAudit('EVENT_DELETED', `Event "${target?.title || id}" removed from schedule`, 'events')
    dispatchUpdate('cluster_events_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      supabase.from('events').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync Error] events.delete:', error.message)
      })
    }

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
    this.logAudit('SPOTLIGHT_SET', `Spotlight promoted: "${activeSpotlight?.title || id}"`, 'events')
    dispatchUpdate('cluster_spotlight_updated', activeSpotlight)
    dispatchUpdate('cluster_events_updated', updated)
    return activeSpotlight
  },

  // ── Homepage Config ──
  getHomepageConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOMEPAGE)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...DEFAULT_HOMEPAGE,
          ...parsed,
          statsEnabled: parsed.statsEnabled !== undefined ? Boolean(parsed.statsEnabled) : false,
          applicationsOpen: parsed.applicationsOpen !== undefined ? Boolean(parsed.applicationsOpen) : true,
        }
      }
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
    this.logAudit('HOMEPAGE_SYNC', 'Homepage copy & announcement ticker updated', 'homepage')
    dispatchUpdate('cluster_homepage_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      const payload = configToDB(updated)
      supabase.from('homepage_config').upsert(payload).then(async ({ error }) => {
        if (error) {
          console.warn('[Supabase Sync Error] homepage_config.upsert:', error.message)
          if (error.code === 'PGRST204' || error.message?.includes('column')) {
            const fallback = { ...payload }
            delete fallback.stats_enabled
            delete fallback.applications_sheet_url
            delete fallback.applications_open
            const { error: retryErr } = await supabase.from('homepage_config').upsert(fallback)
            if (retryErr) console.warn('[Supabase Sync Retry Error]', retryErr.message)
          }
        }
      })
    }

    return updated
  },

  isApplicationsOpen() {
    return this.getHomepageConfig().applicationsOpen !== false
  },

  setApplicationsOpen(isOpen) {
    this.logAudit(
      'RECRUITMENT_TOGGLED',
      isOpen ? 'Membership applications opened for submissions' : 'Membership applications paused / closed',
      'applications'
    )
    return this.updateHomepageConfig({ applicationsOpen: Boolean(isOpen) })
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
    this.logAudit(memberData.id ? 'TEAM_UPDATED' : 'TEAM_ADDED', `Officer profile "${memberData.name}" (${memberData.role}) saved`, 'team')
    dispatchUpdate('cluster_team_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      const payload = memberToDB(memberData)
      if (memberData.id) payload.id = memberData.id
      supabase.from('team_members').upsert(payload).then(({ error }) => {
        if (error) console.warn('[Supabase Sync Error] team_members.upsert:', error.message)
      })
    }

    return updated
  },

  deleteTeamMember(id) {
    const current = this.getTeamMembers()
    const target = current.find((m) => m.id === id)
    const updated = current.filter((m) => m.id !== id)
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(updated))
    this.logAudit('TEAM_REMOVED', `Officer "${target?.name || id}" removed from roster`, 'team')
    dispatchUpdate('cluster_team_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      supabase.from('team_members').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync Error] team_members.delete:', error.message)
      })
    }

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
    this.logAudit('APPLICATION_RECEIVED', `New applicant logged: ${appData.fullName} (${appData.domain})`, 'applications')
    dispatchUpdate('cluster_applications_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      supabase.from('applications').insert(appToDB(newApp)).then(async ({ error }) => {
        if (error) {
          console.warn('[Supabase Sync Error] applications.insert:', error.message)
          // If remote schema doesn't yet have course/branch/year/projects columns, retry with legacy payload
          // (projects folded into motivation so nothing is lost)
          if (error.code === 'PGRST204' || error.message?.includes('column')) {
            const legacyPayload = {
              id: newApp.id,
              full_name: newApp.fullName,
              email: newApp.email,
              roll_number: newApp.rollNumber,
              branch_year: newApp.branchYear || `${newApp.course || ''} · ${newApp.branch || ''} · ${newApp.year || ''}`,
              domain: newApp.domain,
              github: newApp.github || '',
              linkedin: newApp.linkedin || '',
              motivation: [newApp.projects && `Built: ${newApp.projects}`, newApp.motivation].filter(Boolean).join('\n\n'),
              status: newApp.status || 'Pending',
            }
            const { error: retryErr } = await supabase.from('applications').insert(legacyPayload)
            if (retryErr) console.warn('[Supabase Fallback Insert Error]:', retryErr.message)
          }
        }
      })
    }

    // Google Sheets Realtime Webhook Sync (Dynamic / Yearly configurable)
    const sheetWebhookUrl = this.getApplicationsSheetUrl()
    if (sheetWebhookUrl && sheetWebhookUrl.startsWith('http')) {
      try {
        fetch(sheetWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            id: newApp.id,
            fullName: newApp.fullName,
            email: newApp.email,
            rollNumber: newApp.rollNumber,
            course: newApp.course || '',
            branch: newApp.branch || '',
            year: newApp.year || '',
            domain: newApp.domain,
            github: newApp.github || '',
            linkedin: newApp.linkedin || '',
            motivation: newApp.motivation || '',
            status: newApp.status || 'Pending',
            submittedAt: newApp.submittedAt,
            projects: newApp.projects || '',
          }),
        }).catch((err) => console.warn('[Google Sheets Sync Error]', err))
      } catch (err) {
        console.warn('[Google Sheets Sync Trigger Error]', err)
      }
    }

    return newApp
  },

  getApplicationsSheetUrl() {
    try {
      const config = this.getHomepageConfig()
      if (config.applicationsSheetUrl && config.applicationsSheetUrl.trim()) {
        return config.applicationsSheetUrl.trim()
      }
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SHEETS_APPLICATIONS_URL) {
        return import.meta.env.VITE_GOOGLE_SHEETS_APPLICATIONS_URL.trim()
      }
      return ''
    } catch {
      return ''
    }
  },

  updateApplicationsSheetUrl(url) {
    return this.updateHomepageConfig({ applicationsSheetUrl: (url || '').trim() })
  },

  async testApplicationsSheetUrl(testUrl) {
    const url = (testUrl || this.getApplicationsSheetUrl()).trim()
    if (!url || !url.startsWith('http')) {
      return { success: false, message: 'Please enter a valid Webhook URL starting with http:// or https://' }
    }

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          id: `test-${Date.now()}`,
          fullName: 'Test Candidate (CLUSTER Admin)',
          email: 'test.builder@clustersociety.tech',
          rollNumber: 'TEST2026',
          course: 'B.Tech',
          branch: 'Computer Science & Engineering (CSE)',
          year: '2nd Year',
          domain: 'Full-Stack Web Dev',
          github: 'https://github.com/alwin2134',
          linkedin: '',
          projects: 'https://github.com/Cluster-Community-Org/Cluster-Website (Test Project)',
          motivation: 'System test ping from CLUSTER Admin to verify Google Sheet connection.',
          status: 'Pending',
          submittedAt: new Date().toISOString(),
        }),
      })
      return { success: true, message: 'Test row dispatched! Open your Google Sheet to verify the new row.' }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to dispatch test row.' }
    }
  },

  updateApplicationStatus(id, newStatus) {
    const current = this.getApplications()
    const target = current.find((a) => a.id === id)
    const updated = current.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated))
    this.logAudit('STATUS_CHANGED', `Application for "${target?.fullName || id}" updated to ${newStatus}`, 'applications')
    dispatchUpdate('cluster_applications_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      supabase.from('applications').update({ status: newStatus }).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync Error] applications.update:', error.message)
      })
    }

    // Realtime Google Sheet Status Update (Sync status change to sheet)
    const sheetWebhookUrl = this.getApplicationsSheetUrl()
    if (sheetWebhookUrl && sheetWebhookUrl.startsWith('http') && target) {
      try {
        fetch(sheetWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'UPDATE_STATUS',
            id: target.id,
            email: target.email,
            rollNumber: target.rollNumber,
            status: newStatus,
          }),
        }).catch((err) => console.warn('[Google Sheets Status Update Error]', err))
      } catch (err) {
        console.warn('[Google Sheets Status Update Trigger Error]', err)
      }
    }

    return updated
  },

  deleteApplication(id) {
    const current = this.getApplications()
    const target = current.find((a) => a.id === id)
    const updated = current.filter((app) => app.id !== id)
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated))
    this.logAudit('APPLICATION_DELETED', `Application for "${target?.fullName || id}" deleted`, 'applications')
    dispatchUpdate('cluster_applications_updated', updated)

    if (isSupabaseConfigured() && supabase) {
      supabase.from('applications').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Supabase Sync Error] applications.delete:', error.message)
      })
    }

    return updated
  },

  exportApplicationsCSV() {
    const apps = this.getApplications()
    // Defensive sanitization: neutralize CSV formula injection (=, +, -, @, \t, \r)
    const sanitizeCSV = (val) => {
      let str = String(val ?? '').replace(/"/g, '""')
      const c = str.charAt(0)
      if (c === '=' || c === '+' || c === '-' || c === '@' || c === '\t' || c === '\r') {
        str = `'${str}`
      }
      return `"${str}"`
    }
    const headers = ['ID', 'Full Name', 'Email', 'Roll Number', 'Course', 'Branch', 'Year', 'Combined Info', 'Domain', 'Status', 'Submitted At', 'GitHub', 'LinkedIn', 'Motivation', 'Projects']
    const rows = apps.map((a) => [
      sanitizeCSV(a.id),
      sanitizeCSV(a.fullName),
      sanitizeCSV(a.email),
      sanitizeCSV(a.rollNumber),
      sanitizeCSV(a.course),
      sanitizeCSV(a.branch),
      sanitizeCSV(a.year),
      sanitizeCSV(a.branchYear),
      sanitizeCSV(a.domain),
      sanitizeCSV(a.status),
      sanitizeCSV(a.submittedAt),
      sanitizeCSV(a.github),
      sanitizeCSV(a.linkedin),
      sanitizeCSV(a.motivation),
      sanitizeCSV(a.projects),
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

  // ── Audit Log & History ──
  logAudit(action, summary, category = 'system') {
    try {
      const logs = this.getAuditLog()
      const newEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        action,
        summary,
        category,
        timestamp: new Date().toISOString(),
      }
      const updated = [newEntry, ...logs.slice(0, 49)]
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(updated))
      dispatchUpdate('cluster_audit_updated', updated)
      return newEntry
    } catch {
      return null
    }
  },

  getAuditLog() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG)
      if (stored) return JSON.parse(stored)
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(DEFAULT_AUDIT_LOG))
      return DEFAULT_AUDIT_LOG
    } catch {
      return DEFAULT_AUDIT_LOG
    }
  },

  // ── Analytics & Intelligence ──
  getAnalytics() {
    const apps = this.getApplications()
    const events = this.getEvents()
    const team = this.getTeamMembers()

    // Domain distribution
    const domainCounts = {}
    apps.forEach((a) => {
      const dom = a.domain || 'Unspecified'
      domainCounts[dom] = (domainCounts[dom] || 0) + 1
    })

    const totalApps = apps.length || 1
    const domainStats = Object.entries(domainCounts)
      .map(([domain, count]) => ({
        domain,
        count,
        percent: Math.round((count / totalApps) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // Pipeline status counts
    const statusCounts = {
      Pending: 0,
      'Under Review': 0,
      Accepted: 0,
      Waitlisted: 0,
      Rejected: 0,
    }
    apps.forEach((a) => {
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status]++
      }
    })

    const acceptedCount = statusCounts.Accepted || 0
    const acceptanceRate = apps.length > 0 ? Math.round((acceptedCount / apps.length) * 100) : 0

    // Event category breakdown
    const eventTypes = {}
    events.forEach((e) => {
      const t = e.type || 'other'
      eventTypes[t] = (eventTypes[t] || 0) + 1
    })

    return {
      totalApplications: apps.length,
      statusCounts,
      acceptanceRate,
      domainStats,
      totalEvents: events.length,
      eventTypes,
      totalTeam: team.length,
    }
  },

  // ── Backup & Restore Utility ──
  exportBackupJSON() {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      events: this.getEvents(),
      spotlightId: localStorage.getItem(STORAGE_KEYS.SPOTLIGHT_ID),
      team: this.getTeamMembers(),
      applications: this.getApplications(),
      homepage: this.getHomepageConfig(),
      auditLog: this.getAuditLog(),
      socials: this.getSocialLinks(),
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cluster_cms_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  importBackupJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr)
      if (data.events) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events))
        dispatchUpdate('cluster_events_updated', data.events)
      }
      if (data.spotlightId) {
        localStorage.setItem(STORAGE_KEYS.SPOTLIGHT_ID, String(data.spotlightId))
      }
      if (data.team) {
        localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(data.team))
        dispatchUpdate('cluster_team_updated', data.team)
      }
      if (data.applications) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data.applications))
        dispatchUpdate('cluster_applications_updated', data.applications)
      }
      if (data.homepage) {
        localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(data.homepage))
        dispatchUpdate('cluster_homepage_updated', data.homepage)
      }
      if (data.auditLog) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(data.auditLog))
        dispatchUpdate('cluster_audit_updated', data.auditLog)
      }
      if (data.socials && Array.isArray(data.socials)) {
        localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(data.socials))
        dispatchUpdate('cluster_socials_updated', data.socials)
      }
      this.logAudit('BACKUP_RESTORED', 'Full society database snapshot restored', 'system')
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  // ── Socials & Linktree Management ──
  getSocialLinks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SOCIALS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.order || 0) - (b.order || 0))
        }
      }
      localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(DEFAULT_SOCIAL_LINKS))
      return DEFAULT_SOCIAL_LINKS
    } catch {
      return DEFAULT_SOCIAL_LINKS
    }
  },

  updateSocialLinks(links) {
    localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(links))
    this.logAudit('SOCIALS_UPDATED', `Social links updated (${links.filter((l) => l.enabled !== false).length} active)`, 'socials')
    dispatchUpdate('cluster_socials_updated', links)

    if (isSupabaseConfigured() && supabase) {
      // 1. Primary communication table: dedicated 'social_links' table
      const rows = links.map((l, idx) => socialLinkToDB(l, idx))
      supabase
        .from('social_links')
        .upsert(rows)
        .then(({ error }) => {
          if (error) {
            // Fallback: If social_links table doesn't exist yet, save inside stats JSONB on homepage_config
            const currentConfig = this.getHomepageConfig()
            const rawStats = Array.isArray(currentConfig.stats) ? currentConfig.stats : []
            const cleanStats = rawStats.filter((s) => !s || s.__type !== 'cluster_social_links')
            cleanStats.push({ __type: 'cluster_social_links', links })

            supabase
              .from('homepage_config')
              .update({ stats: cleanStats, updated_at: new Date().toISOString() })
              .eq('id', 1)
              .then(({ error: statsErr }) => {
                if (statsErr) console.warn('[Supabase Fallback Sync Notice]:', statsErr.message)
              })
          }
        })
    }

    return links
  },

  toggleSocialLink(id) {
    const current = this.getSocialLinks()
    const target = current.find((l) => l.id === id)
    if (!target) return current
    const nextState = !(target.enabled !== false)
    const updated = current.map((l) => (l.id === id ? { ...l, enabled: nextState } : l))
    
    localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(updated))
    dispatchUpdate('cluster_socials_updated', updated)
    this.logAudit(
      'SOCIAL_TOGGLED',
      `"${target.title}" ${nextState ? 'enabled' : 'disabled'} on Linktree`,
      'socials'
    )

    if (isSupabaseConfigured() && supabase) {
      // Direct update to dedicated table row
      supabase
        .from('social_links')
        .update({ enabled: nextState, updated_at: new Date().toISOString() })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            // Fallback to full sync
            this.updateSocialLinks(updated)
          }
        })
    }

    return updated
  },

  saveSocialLink(linkData) {
    const current = this.getSocialLinks()
    let updated
    if (linkData.id && current.some((l) => l.id === linkData.id)) {
      updated = current.map((l) => (l.id === linkData.id ? { ...l, ...linkData } : l))
    } else {
      const newLink = {
        ...linkData,
        id: linkData.id || `custom-${Date.now()}`,
        enabled: linkData.enabled !== undefined ? linkData.enabled : true,
        order: current.length + 1,
      }
      updated = [...current, newLink]
    }
    return this.updateSocialLinks(updated)
  },

  deleteSocialLink(id) {
    const current = this.getSocialLinks()
    const updated = current.filter((l) => l.id !== id)
    localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(updated))
    dispatchUpdate('cluster_socials_updated', updated)
    this.logAudit('SOCIAL_DELETED', `Link ID "${id}" removed from Linktree`, 'socials')

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('social_links')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            this.updateSocialLinks(updated)
          }
        })
    }

    return updated
  },

  resetSocialLinks() {
    return this.updateSocialLinks(DEFAULT_SOCIAL_LINKS)
  },

  // ── Supabase Realtime & Remote Hydration ──
  async syncFromSupabase() {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase is not configured' }
    }

    try {
      const results = {}

      // 1. Fetch remote Events
      const { data: remoteEvents, error: eventsErr } = await supabase.from('events').select('*').order('id', { ascending: true })
      if (!eventsErr && Array.isArray(remoteEvents)) {
        if (remoteEvents.length > 0) {
          const mapped = remoteEvents.map(eventFromDB)
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mapped))
          dispatchUpdate('cluster_events_updated', mapped)
        }
        results.events = remoteEvents.length
      } else if (eventsErr) {
        console.warn('[Supabase Sync] Events fetch error:', eventsErr.message)
      }

      // 2. Fetch remote Team Members
      const { data: remoteTeam, error: teamErr } = await supabase.from('team_members').select('*').order('id', { ascending: true })
      if (!teamErr && Array.isArray(remoteTeam)) {
        if (remoteTeam.length > 0) {
          const mapped = remoteTeam.map(memberFromDB)
          localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(mapped))
          dispatchUpdate('cluster_team_updated', mapped)
        }
        results.team = remoteTeam.length
      } else if (teamErr) {
        console.warn('[Supabase Sync] Team fetch error:', teamErr.message)
      }

      // 3. Fetch remote Applications (only update if remote returns records)
      const { data: remoteApps, error: appsErr } = await supabase.from('applications').select('*').order('submitted_at', { ascending: false })
      if (!appsErr && Array.isArray(remoteApps)) {
        if (remoteApps.length > 0) {
          const mapped = remoteApps.map(appFromDB)
          localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(mapped))
          dispatchUpdate('cluster_applications_updated', mapped)
        }
        results.applications = remoteApps.length
      } else if (appsErr) {
        console.warn('[Supabase Sync] Applications fetch error (check RLS):', appsErr.message)
      }

      // 4. Fetch remote Homepage Config
      const { data: remoteConfig, error: configErr } = await supabase.from('homepage_config').select('*').eq('id', 1).maybeSingle()
      if (!configErr && remoteConfig) {
        const mapped = configFromDB(remoteConfig)
        localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(mapped))
        dispatchUpdate('cluster_homepage_updated', mapped)
        results.homepage = true
      }

      // 5. Fetch remote Social Links from dedicated 'social_links' table
      const { data: remoteSocials, error: socialsErr } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!socialsErr && Array.isArray(remoteSocials) && remoteSocials.length > 0) {
        const mapped = remoteSocials.map(socialLinkFromDB)
        localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(mapped))
        dispatchUpdate('cluster_socials_updated', mapped)
        results.socials = remoteSocials.length
      }

      return { success: true, results }
    } catch (err) {
      console.warn('[Supabase Sync Error]', err)
      return { success: false, error: err.message }
    }
  },

  async initSupabaseSync() {
    if (!isSupabaseConfigured() || !supabase) return

    try {
      await this.syncFromSupabase()

      // Subscribe to Realtime Postgres changes across society tables
      supabase
        .channel('cluster-cms-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () => {
          const { data } = await supabase.from('events').select('*')
          if (data) {
            const mapped = data.map(eventFromDB)
            localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mapped))
            dispatchUpdate('cluster_events_updated', mapped)
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, async () => {
          const { data } = await supabase.from('applications').select('*')
          if (data) {
            const mapped = data.map(appFromDB)
            localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(mapped))
            dispatchUpdate('cluster_applications_updated', mapped)
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_config' }, async () => {
          const { data } = await supabase.from('homepage_config').select('*').eq('id', 1).maybeSingle()
          if (data) {
            const mapped = configFromDB(data)
            localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(mapped))
            dispatchUpdate('cluster_homepage_updated', mapped)
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'social_links' }, async () => {
          const { data } = await supabase.from('social_links').select('*').order('sort_order', { ascending: true })
          if (data && Array.isArray(data) && data.length > 0) {
            const mapped = data.map(socialLinkFromDB)
            localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(mapped))
            dispatchUpdate('cluster_socials_updated', mapped)
          }
        })
        .subscribe()
    } catch (err) {
      console.warn('[Supabase Sync Initialization]', err)
    }
  },
}

// Automatically trigger Supabase synchronization on app startup
if (typeof window !== 'undefined') {
  clusterDataService.initSupabaseSync()
}

