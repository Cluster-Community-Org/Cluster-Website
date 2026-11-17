// ==============================================================================
// CLUSTER Society — Analytics Service (Supabase RPCs & Demo Fixtures)
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const IS_DEMO =
  import.meta.env.VITE_ANALYTICS_DEMO === 'true' ||
  import.meta.env.VITE_ANALYTICS_DEMO === true

// Deterministic demo fixtures when VITE_ANALYTICS_DEMO is enabled
function getDemoTimeseries(from, to) {
  const fromTs = new Date(from).getTime()
  const toTs = new Date(to).getTime()
  const days = Math.max(1, Math.round((toTs - fromTs) / (24 * 60 * 60 * 1000)))

  const list = []
  for (let i = 0; i < days; i++) {
    const d = new Date(fromTs + i * 24 * 60 * 60 * 1000)
    const dayStr = d.toISOString().split('T')[0]
    const base = 70 + (i * 9) % 65
    list.push({
      day: dayStr,
      visitors: base,
      pageviews: Math.round(base * 2.3),
    })
  }
  return list
}

const DEMO_TOP = {
  path: [
    { label: '/', visitors: 2150, pageviews: 3800 },
    { label: '/events', visitors: 1120, pageviews: 1540 },
    { label: '/join', visitors: 610, pageviews: 720 },
    { label: '/team', visitors: 430, pageviews: 510 },
  ],
  source: [
    { label: 'instagram', visitors: 1240, pageviews: 2600 },
    { label: 'direct', visitors: 820, pageviews: 1900 },
    { label: 'whatsapp', visitors: 410, pageviews: 890 },
    { label: 'google', visitors: 210, pageviews: 580 },
    { label: 'linkedin', visitors: 160, pageviews: 450 },
  ],
  device: [
    { label: 'mobile', visitors: 1840, pageviews: 3900 },
    { label: 'desktop', visitors: 910, pageviews: 2280 },
    { label: 'tablet', visitors: 90, pageviews: 240 },
  ],
  utm_campaign: [
    { label: 'kickstart26', visitors: 640, pageviews: 1100 },
    { label: 'inductions', visitors: 390, pageviews: 740 },
    { label: 'poster_canteen', visitors: 190, pageviews: 380 },
  ],
}

const DEMO_INTEREST = [
  { target: 'event:kickstart26', impressions: 840, clicks: 295, ctr: 35.1 },
  { target: 'event:hands-on-dgx', impressions: 620, clicks: 180, ctr: 29.0 },
  { target: 'event:jetson-robotics', impressions: 430, clicks: 110, ctr: 25.6 },
  { target: 'section:hero', impressions: 2450, clicks: 0, ctr: null },
  { target: 'section:why', impressions: 1820, clicks: 0, ctr: null },
  { target: 'section:circles', impressions: 1450, clicks: 0, ctr: null },
  { target: 'section:how', impressions: 1120, clicks: 0, ctr: null },
  { target: 'section:spotlight', impressions: 980, clicks: 0, ctr: null },
  { target: 'section:faq', impressions: 720, clicks: 0, ctr: null },
  { target: 'section:cta', impressions: 640, clicks: 0, ctr: null },
  { target: 'apply_cta', impressions: 0, clicks: 310, ctr: null },
  { target: 'banner_cta', impressions: 0, clicks: 145, ctr: null },
  { target: 'team_github', impressions: 0, clicks: 88, ctr: null },
  { target: 'team_linkedin', impressions: 0, clicks: 64, ctr: null },
]

const DEMO_FUNNEL = {
  steps: {
    view: 610,
    start: 420,
    projects: 210,
    submit: 94,
  },
  abandonment: [
    { field: 'projects', count: 96 },
    { field: 'motivation', count: 48 },
    { field: 'tracks', count: 32 },
    { field: 'rollNumber', count: 24 },
    { field: 'github', count: 18 },
  ],
}

const DEMO_SOURCE_CONVERSION = [
  { source: 'instagram', visits: 1240, applicants: 52, rate: 4.2 },
  { source: 'whatsapp', visits: 410, applicants: 24, rate: 5.9 },
  { source: 'direct', visits: 820, applicants: 12, rate: 1.5 },
  { source: 'qr-canteen', visits: 190, applicants: 9, rate: 4.7 },
  { source: 'google', visits: 210, applicants: 4, rate: 1.9 },
  { source: 'linkedin', visits: 160, applicants: 3, rate: 1.9 },
]

const DEMO_APPLICANTS = {
  by_branch: [
    { label: 'Computer Science & Engineering (CSE)', count: 48 },
    { label: 'AI & Machine Learning (AIML)', count: 22 },
    { label: 'AI & Data Science (AIDS)', count: 12 },
    { label: 'Electronics & Communication (ECE)', count: 8 },
    { label: 'Information Technology (IT)', count: 4 },
  ],
  by_year: [
    { label: '2nd Year', count: 42 },
    { label: '1st Year', count: 31 },
    { label: '3rd Year', count: 18 },
    { label: '4th Year', count: 3 },
  ],
  by_domain: [
    { label: 'Compute', count: 44 },
    { label: 'Applied AI', count: 36 },
    { label: 'Crew', count: 14 },
  ],
  by_status: [
    { label: 'Pending', count: 62 },
    { label: 'Under Review', count: 20 },
    { label: 'Accepted', count: 8 },
    { label: 'Waitlisted', count: 4 },
  ],
}

const DEMO_HEALTH = {
  vitals: {
    lcp: { p75: 1850, count: 142 },
    inp: { p75: 110, count: 128 },
    cls: { p75: 0.042, count: 142 },
  },
  js_errors: 3,
  not_found_errors: 7,
  errors: {
    js: 3,
    not_found: 7,
    total: 10,
  },
  top_404: [
    { path: '/discord', count: 4 },
    { path: '/events/hackathon-2025', count: 2 },
    { path: '/register', count: 1 },
  ],
}

/**
 * Handles RPC execution with standardized response wrapping.
 */
async function callRpc(fnName, params) {
  if (IS_DEMO) {
    if (fnName === 'analytics_overview') {
      return {
        configured: true,
        data: {
          visitors: 2840,
          pageviews: 6420,
          bounce_rate: 42.5,
          join_views: 610,
          join_submits: 94,
        },
      }
    }
    if (fnName === 'analytics_timeseries') {
      return {
        configured: true,
        data: getDemoTimeseries(params.p_from, params.p_to),
      }
    }
    if (fnName === 'analytics_top') {
      const dim = params.p_dim || 'path'
      const rows = DEMO_TOP[dim] || []
      return {
        configured: true,
        data: rows.slice(0, params.p_limit || 10),
      }
    }
    if (fnName === 'analytics_interest') {
      return {
        configured: true,
        data: DEMO_INTEREST,
      }
    }
    if (fnName === 'analytics_funnel') {
      return {
        configured: true,
        data: DEMO_FUNNEL,
      }
    }
    if (fnName === 'analytics_source_conversion') {
      return {
        configured: true,
        data: DEMO_SOURCE_CONVERSION,
      }
    }
    if (fnName === 'analytics_applicants') {
      return {
        configured: true,
        data: DEMO_APPLICANTS,
      }
    }
    if (fnName === 'analytics_health') {
      return {
        configured: true,
        data: DEMO_HEALTH,
      }
    }
    if (fnName === 'analytics_purge') {
      return {
        configured: true,
        data: 0,
      }
    }
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { configured: false, data: null }
  }

  try {
    const { data, error } = await supabase.rpc(fnName, params)

    if (error) {
      if (
        error.code === '42501' ||
        (error.message && error.message.toLowerCase().includes('not authorized'))
      ) {
        return { error: 'auth', configured: true, data: null }
      }
      return { error: error.message || 'RPC Error', configured: true, data: null }
    }

    return { configured: true, data, error: null }
  } catch (err) {
    return { error: err.message || 'Network error', configured: true, data: null }
  }
}

export const analyticsService = {
  isConfigured: () => isSupabaseConfigured() || IS_DEMO,

  /**
   * Fetches high-level metrics for a date range.
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getOverview(from, to) {
    return callRpc('analytics_overview', { p_from: from, p_to: to })
  },

  /**
   * Fetches daily zero-filled timeseries.
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getTimeseries(from, to) {
    return callRpc('analytics_timeseries', { p_from: from, p_to: to })
  },

  /**
   * Fetches top breakdown items for a dimension ('path', 'source', 'device', 'utm_campaign').
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   * @param {'path'|'source'|'device'|'utm_campaign'} dim
   * @param {number} [limit=10]
   */
  async getTop(from, to, dim, limit = 10) {
    return callRpc('analytics_top', {
      p_from: from,
      p_to: to,
      p_dim: dim,
      p_limit: limit,
    })
  },

  /**
   * Fetches element impressions, click counts, and RSVP CTR.
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getInterest(from, to) {
    return callRpc('analytics_interest', { p_from: from, p_to: to })
  },

  /**
   * Fetches form progression funnel and last-field abandonment.
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getFunnel(from, to) {
    return callRpc('analytics_funnel', { p_from: from, p_to: to })
  },

  /**
   * Fetches channel conversion efficiency (visits vs applicants).
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getSourceConversion(from, to) {
    return callRpc('analytics_source_conversion', { p_from: from, p_to: to })
  },

  /**
   * Fetches demographic and academic breakdown of applicants.
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getApplicants(from, to) {
    return callRpc('analytics_applicants', { p_from: from, p_to: to })
  },

  /**
   * Fetches health telemetry: vitals p75, JS errors, 404 counts and paths.
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getHealth(from, to) {
    return callRpc('analytics_health', { p_from: from, p_to: to })
  },

  /**
   * Purges analytics events older than specified retention period (days).
   * @param {number} [days=90]
   */
  async purge(days = 90) {
    return callRpc('analytics_purge', { p_days: days })
  },

  /**
   * Retrieves audit logs in the specified date range.
   * @param {string} from - ISO timestamp
   * @param {string} to - ISO timestamp
   */
  async getAuditRange(from, to) {
    if (isSupabaseConfigured() && supabase && !IS_DEMO) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .gte('created_at', from)
          .lte('created_at', to)
          .order('created_at', { ascending: false })

        if (!error && data) {
          return { configured: true, data, error: null }
        }
      } catch {
        // fallback to local
      }
    }

    try {
      const stored = localStorage.getItem('cluster_audit_log')
      const logs = stored ? JSON.parse(stored) : []
      const fromTs = new Date(from).getTime()
      const toTs = new Date(to).getTime()
      const filtered = logs.filter((l) => {
        const t = new Date(l.created_at || l.timestamp).getTime()
        return t >= fromTs && t <= toTs
      })
      return { configured: true, data: filtered, error: null }
    } catch {
      return { configured: true, data: [], error: null }
    }
  },
}
