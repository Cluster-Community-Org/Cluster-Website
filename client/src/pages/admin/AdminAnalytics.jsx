import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LineChart as LineChartIcon,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Download,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  Clock,
  Bug,
} from 'lucide-react'
import {
  KpiTile,
  LineChart,
  BarList,
  RangePicker,
  Tabs,
  FunnelBars,
} from '../../components/admin/analytics/index.js'
import { analyticsService } from '../../services/analyticsService.js'
import {
  rangeToDates,
  previousRange,
  pctDelta,
  formatCompact,
  formatPct,
  rateVital,
  toCsv,
  funnelRows,
} from '../../lib/analyticsFormat.js'

export default function AdminAnalytics() {
  const [rangeDays, setRangeDays] = useState(30)
  const [activeTab, setActiveTab] = useState('traffic')
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [notConfigured, setNotConfigured] = useState(false)

  // Traffic State
  const [overview, setOverview] = useState(null)
  const [prevOverview, setPrevOverview] = useState(null)
  const [timeseries, setTimeseries] = useState([])
  const [topPages, setTopPages] = useState([])
  const [topSources, setTopSources] = useState([])
  const [topDevices, setTopDevices] = useState([])
  const [topCampaigns, setTopCampaigns] = useState([])
  const [interestData, setInterestData] = useState([])
  const [funnelData, setFunnelData] = useState(null)
  const [sourceConversion, setSourceConversion] = useState([])
  const [applicantsData, setApplicantsData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [purging, setPurging] = useState(false)
  const [purgeResult, setPurgeResult] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setAuthError(false)
    setNotConfigured(false)

    const currRange = rangeToDates(rangeDays)
    const prevRange = previousRange(currRange)

    try {
      const [
        ovRes,
        prevOvRes,
        tsRes,
        pagesRes,
        sourcesRes,
        devicesRes,
        campaignsRes,
        interestRes,
        funnelRes,
        conversionRes,
        applicantsRes,
        healthRes,
        auditRes,
      ] = await Promise.all([
        analyticsService.getOverview(currRange.from, currRange.to),
        analyticsService.getOverview(prevRange.from, prevRange.to),
        analyticsService.getTimeseries(currRange.from, currRange.to),
        analyticsService.getTop(currRange.from, currRange.to, 'path', 8),
        analyticsService.getTop(currRange.from, currRange.to, 'source', 8),
        analyticsService.getTop(currRange.from, currRange.to, 'device', 8),
        analyticsService.getTop(currRange.from, currRange.to, 'utm_campaign', 8),
        analyticsService.getInterest(currRange.from, currRange.to),
        analyticsService.getFunnel(currRange.from, currRange.to),
        analyticsService.getSourceConversion(currRange.from, currRange.to),
        analyticsService.getApplicants(currRange.from, currRange.to),
        analyticsService.getHealth(currRange.from, currRange.to),
        analyticsService.getAuditRange(currRange.from, currRange.to),
      ])

      // Handle unconfigured or authorization failure
      if (ovRes.configured === false) {
        setNotConfigured(true)
        setLoading(false)
        return
      }

      if (ovRes.error === 'auth' || tsRes.error === 'auth') {
        setAuthError(true)
        setLoading(false)
        return
      }

      setOverview(ovRes.data)
      setPrevOverview(prevOvRes.data)
      setTimeseries(tsRes.data || [])
      setTopPages(pagesRes.data || [])
      setTopSources(sourcesRes.data || [])
      setTopDevices(devicesRes.data || [])
      setTopCampaigns(campaignsRes.data || [])
      setInterestData(interestRes.data || [])
      setFunnelData(funnelRes.data || null)
      setSourceConversion(conversionRes.data || [])
      setApplicantsData(applicantsRes.data || null)
      setHealthData(healthRes.data || null)
      setAuditLogs(auditRes.data || [])
    } catch (err) {
      console.error('Failed to load analytics data:', err)
    } finally {
      setLoading(false)
    }
  }, [rangeDays])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Delta calculations vs previous period
  const visitorsDelta = pctDelta(overview?.visitors, prevOverview?.visitors)
  const pageviewsDelta = pctDelta(overview?.pageviews, prevOverview?.pageviews)
  const bounceDelta = pctDelta(overview?.bounce_rate, prevOverview?.bounce_rate)
  const joinDelta = pctDelta(overview?.join_views, prevOverview?.join_views)

  // Filter audit logs for vertical chart annotations
  const auditAnnotations = useMemo(() => {
    return auditLogs.filter(
      (log) => log.action === 'HOMEPAGE_SYNC' || log.action === 'RECRUITMENT_TOGGLED'
    )
  }, [auditLogs])

  // Compute content freshness per category
  const freshnessByCategory = useMemo(() => {
    const map = {}
    auditLogs.forEach((log) => {
      const cat = log.category || 'system'
      const time = log.created_at || log.timestamp
      if (!map[cat] || new Date(time) > new Date(map[cat].time)) {
        map[cat] = {
          category: cat,
          action: log.action,
          summary: log.summary,
          time,
        }
      }
    })
    return Object.values(map)
  }, [auditLogs])

  const handleExportCsv = () => {
    const filename = `cluster-analytics-${activeTab}-${rangeDays}d.csv`
    let csv = ''

    if (activeTab === 'traffic') {
      const rows = timeseries.map((t) => ({
        day: t.day,
        visitors: t.visitors,
        pageviews: t.pageviews,
      }))
      const cols = [
        { key: 'day', label: 'Date' },
        { key: 'visitors', label: 'Unique Visitors' },
        { key: 'pageviews', label: 'Total Pageviews' },
      ]
      csv = toCsv(rows, cols)
    } else if (activeTab === 'interest') {
      const rows = interestData.map((i) => ({
        target: i.target,
        impressions: i.impressions,
        clicks: i.clicks,
        ctr: i.ctr,
      }))
      const cols = [
        { key: 'target', label: 'Element / Event Target' },
        { key: 'impressions', label: 'View Impressions' },
        { key: 'clicks', label: 'Clicks' },
        { key: 'ctr', label: 'CTR (%)' },
      ]
      csv = toCsv(rows, cols)
    } else if (activeTab === 'funnel') {
      const rows = funnelRows(funnelData?.steps)
      const cols = [
        { key: 'step', label: 'Funnel Stage' },
        { key: 'count', label: 'Visitor Count' },
        { key: 'conversion', label: 'Stage Conversion (%)' },
      ]
      csv = toCsv(rows, cols)
    } else if (activeTab === 'applicants') {
      const rows = [
        ...(applicantsData?.by_domain || []).map((d) => ({
          dimension: 'Domain',
          label: d.label,
          count: d.count,
        })),
        ...(applicantsData?.by_branch || []).map((b) => ({
          dimension: 'Branch',
          label: b.label,
          count: b.count,
        })),
        ...(applicantsData?.by_year || []).map((y) => ({
          dimension: 'Graduation Year',
          label: y.label,
          count: y.count,
        })),
        ...(applicantsData?.by_status || []).map((s) => ({
          dimension: 'Status',
          label: s.label,
          count: s.count,
        })),
      ]
      const cols = [
        { key: 'dimension', label: 'Dimension' },
        { key: 'label', label: 'Category' },
        { key: 'count', label: 'Applicant Count' },
      ]
      csv = toCsv(rows, cols)
    } else if (activeTab === 'health') {
      const rows = (healthData?.top_404 || []).map((p) => ({
        path: p.path,
        count: p.count,
      }))
      const cols = [
        { key: 'path', label: '404 URL Path' },
        { key: 'count', label: 'Error Occurrences' },
      ]
      csv = toCsv(rows, cols)
    }

    if (!csv) return

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePurge = async (days = 90) => {
    if (!window.confirm(`Purge analytics events older than ${days} days? This action is permanent.`)) {
      return
    }
    setPurging(true)
    setPurgeResult(null)
    try {
      const res = await analyticsService.purge(days)
      if (res.error) {
        setPurgeResult({ error: res.error })
      } else {
        setPurgeResult({ success: true, count: res.data })
        loadData()
      }
    } catch (err) {
      setPurgeResult({ error: err.message || 'Purge failed' })
    } finally {
      setPurging(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cluster-acid/10 border border-cluster-acid/20 text-cluster-acid">
              <LineChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
                Analytics & Insights
              </h1>
              <p className="text-xs font-mono text-[#8E8E88] mt-0.5">
                Privacy-first audience telemetry & engagement analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RangePicker value={rangeDays} onChange={setRangeDays} />
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0F1012] border border-white/[0.08] text-xs font-mono text-[#8E8E88] hover:text-white hover:border-white/20 transition-all shadow-sm"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-cluster-acid" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#0F1012] border border-white/[0.08] text-[#8E8E88] hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Inline Auth / Unconfigured Guards (Task 8) */}
      {authError && (
        <div className="rounded-2xl p-6 bg-rose-500/[0.06] border border-rose-500/20 text-rose-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-1">
            <p className="font-semibold text-rose-200">
              Sign in with Supabase to view analytics.
            </p>
            <p className="text-[#8E8E88]">
              Your current session does not hold authenticated database admin privileges. Please sign in via the administrative portal.
            </p>
          </div>
        </div>
      )}

      {notConfigured && !authError && (
        <div className="rounded-2xl p-6 bg-amber-500/[0.06] border border-amber-500/20 text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-1">
            <p className="font-semibold text-amber-200">
              Analytics is not configured
            </p>
            <p className="text-[#8E8E88]">
              Supabase environment variables are missing. Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> or enable <code>VITE_ANALYTICS_DEMO=true</code> for demonstration mode.
            </p>
          </div>
        </div>
      )}

      {/* Active Tab Content */}
      {activeTab === 'traffic' && (
        <div className="space-y-8">
          {/* KPI Tiles Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile
              title="Visitors (approx.)"
              value={formatCompact(overview?.visitors)}
              delta={visitorsDelta}
              subtitle={`vs prev ${rangeDays}d`}
              loading={loading}
              badge="IST"
            />
            <KpiTile
              title="Total Pageviews"
              value={formatCompact(overview?.pageviews)}
              delta={pageviewsDelta}
              subtitle={`vs prev ${rangeDays}d`}
              loading={loading}
            />
            <KpiTile
              title="Bounce Rate"
              value={overview?.bounce_rate != null ? `${overview.bounce_rate}%` : '—'}
              delta={bounceDelta}
              subtitle={`vs prev ${rangeDays}d`}
              loading={loading}
              invertTrend={true}
            />
            <KpiTile
              title="Join Form Views"
              value={formatCompact(overview?.join_views)}
              delta={joinDelta}
              subtitle={`vs prev ${rangeDays}d`}
              loading={loading}
            />
          </div>

          {/* Daily Visitors & Pageviews Line Chart */}
          <LineChart
            data={timeseries}
            annotations={auditAnnotations}
            metricKey="visitors"
            secondaryKey="pageviews"
            labelKey="day"
            loading={loading}
            title={`Traffic Overview (${rangeDays} Days)`}
          />

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarList
              title="Top Pages"
              subtitle="Most visited routes across the platform"
              items={topPages}
              valueKey="visitors"
              loading={loading}
            />

            <BarList
              title="Traffic Sources"
              subtitle="Channels driving student engagement"
              items={topSources}
              valueKey="visitors"
              loading={loading}
            />

            <BarList
              title="Device Breakdown"
              subtitle="Client form-factor distribution"
              items={topDevices}
              valueKey="visitors"
              loading={loading}
            />

            <BarList
              title="Top Campaigns"
              subtitle="Campaigns tagged with utm_campaign"
              items={topCampaigns}
              valueKey="visitors"
              loading={loading}
              emptyMessage="No tagged UTM campaign traffic recorded yet"
            />
          </div>
        </div>
      )}

      {/* Interest Tab Content (Phase 3) */}
      {activeTab === 'interest' && (
        <div className="space-y-8">
          {/* Event Cards & RSVP Conversion */}
          <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                Event Impressions & RSVP Conversion
              </h3>
              <p className="text-xs font-mono text-[#8E8E88] mt-0.5">
                Measures card viewability (scrolled &gt;= 50% into view) and RSVP click conversion rate
              </p>
            </div>

            {(() => {
              const events = interestData.filter((i) => i.target.startsWith('event:'))
              if (loading) {
                return (
                  <div className="space-y-3 pt-2">
                    {[1, 2, 3].map((k) => (
                      <div key={k} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )
              }
              if (events.length === 0) {
                return (
                  <div className="py-12 text-center text-xs font-mono text-[#8E8E88] border border-dashed border-white/[0.06] rounded-xl">
                    No event impressions recorded for this date range
                  </div>
                )
              }
              return (
                <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                  {events.map((ev, idx) => {
                    const slug = ev.target.replace(/^event:/, '')
                    return (
                      <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-mono text-cluster-acid uppercase font-semibold">Event</span>
                          <h4 className="text-sm font-mono text-white font-medium capitalize mt-0.5">
                            {slug.replace(/-/g, ' ')}
                          </h4>
                          <span className="text-[11px] font-mono text-[#8E8E88]">slug: {slug}</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-mono">
                          <div className="text-right">
                            <span className="text-[#8E8E88] block text-[10px] uppercase">Impressions</span>
                            <span className="text-white font-semibold text-sm">{formatCompact(ev.impressions)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[#8E8E88] block text-[10px] uppercase">RSVP Clicks</span>
                            <span className="text-white font-semibold text-sm">{formatCompact(ev.clicks)}</span>
                          </div>
                          <div className="text-right min-w-[70px]">
                            <span className="text-[#8E8E88] block text-[10px] uppercase">RSVP CTR</span>
                            <span className={`font-semibold text-sm ${ev.ctr != null ? 'text-cluster-acid' : 'text-[#8E8E88]'}`}>
                              {ev.ctr != null ? `${ev.ctr}%` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Homepage Section Reach */}
            <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                  Homepage Section Scroll Depth
                </h3>
                <p className="text-xs font-mono text-[#8E8E88] mt-0.5">
                  Visitor sessions that scrolled each homepage section into view
                </p>
              </div>

              {(() => {
                const sectionOrder = ['hero', 'why', 'circles', 'how', 'spotlight', 'faq', 'cta']
                const sectionsMap = new Map(
                  interestData
                    .filter((i) => i.target.startsWith('section:'))
                    .map((i) => [i.target.replace(/^section:/, ''), i])
                )
                const totalVisitors = overview?.visitors || 1

                return (
                  <div className="space-y-3.5 pt-2">
                    {sectionOrder.map((secName, idx) => {
                      const item = sectionsMap.get(secName)
                      const count = item?.impressions || 0
                      const reach = Math.min(100, Math.round((count / totalVisitors) * 100))

                      return (
                        <div key={idx} className="group">
                          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                            <span className="text-white capitalize font-medium">
                              {idx + 1}. {secName === 'cta' ? 'Final CTA' : secName} Section
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">{formatCompact(count)}</span>
                              <span className="text-cluster-acid text-[11px] w-10 text-right">{reach}%</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cluster-acid rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${reach}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

            {/* Other Interaction & Outbound Clicks */}
            <BarList
              title="Interaction & CTA Clicks"
              subtitle="Engagement with buttons, banners & social links"
              items={interestData
                .filter((i) => !i.target.startsWith('event:') && !i.target.startsWith('section:') && i.clicks > 0)
                .map((i) => ({ label: i.target, visitors: i.clicks }))}
              valueKey="visitors"
              loading={loading}
              emptyMessage="No interaction clicks recorded in this period"
            />
          </div>
        </div>
      )}

      {/* Funnel Tab Content (Phase 4) */}
      {activeTab === 'funnel' && (
        <div className="space-y-8">
          <FunnelBars steps={funnelData?.steps} loading={loading} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Last Field Abandonment Analysis */}
            <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                  Drop-off Field Abandonment
                </h3>
                <p className="text-xs font-mono text-[#8E8E88] mt-0.5">
                  Last focused form field for sessions that started but did not submit
                </p>
              </div>

              {loading ? (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map((k) => (
                    <div key={k} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : !funnelData?.abandonment || funnelData.abandonment.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-[#8E8E88] border border-dashed border-white/[0.06] rounded-xl">
                  No abandonment recorded in this period
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {funnelData.abandonment.map((item, idx) => {
                    const maxAbandon = Math.max(
                      ...funnelData.abandonment.map((i) => i.count),
                      1
                    )
                    const pct = Math.round((item.count / maxAbandon) * 100)

                    return (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <span className="text-white capitalize font-medium">
                            Field: {item.field}
                          </span>
                          <span className="text-white font-semibold">
                            {formatCompact(item.count)} sessions
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500/80 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Source Conversion Table */}
            <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                  Source-to-Applicant Conversion
                </h3>
                <p className="text-xs font-mono text-[#8E8E88] mt-0.5">
                  Conversion efficiency by referral channel and marketing touchpoint
                </p>
              </div>

              {loading ? (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map((k) => (
                    <div key={k} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : sourceConversion.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-[#8E8E88] border border-dashed border-white/[0.06] rounded-xl">
                  No source conversion data recorded
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[#8E8E88]">
                        <th className="pb-2 font-normal">Source</th>
                        <th className="pb-2 font-normal text-right">Visits</th>
                        <th className="pb-2 font-normal text-right">Applicants</th>
                        <th className="pb-2 font-normal text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {sourceConversion.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 text-white font-medium capitalize">
                            {row.source}
                          </td>
                          <td className="py-2.5 text-right text-[#8E8E88]">
                            {formatCompact(row.visits)}
                          </td>
                          <td className="py-2.5 text-right text-white font-semibold">
                            {formatCompact(row.applicants)}
                          </td>
                          <td className="py-2.5 text-right text-cluster-acid font-semibold">
                            {row.rate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Applicants Tab Content (Phase 4) */}
      {activeTab === 'applicants' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarList
              title="Applicants by Branch"
              subtitle="Academic specialization distribution"
              items={applicantsData?.by_branch || []}
              valueKey="count"
              loading={loading}
              emptyMessage="No applications received in this date range"
            />

            <BarList
              title="Applicants by Graduation Year"
              subtitle="Cohort distribution across batches"
              items={applicantsData?.by_year || []}
              valueKey="count"
              loading={loading}
              emptyMessage="No applications received in this date range"
            />

            <BarList
              title="Domain & Circle Interest"
              subtitle="Selected technical circles"
              items={applicantsData?.by_domain || []}
              valueKey="count"
              loading={loading}
              emptyMessage="No applications received in this date range"
            />

            <BarList
              title="Recruitment Pipeline Status"
              subtitle="Progress through evaluation stages"
              items={applicantsData?.by_status || []}
              valueKey="count"
              loading={loading}
              emptyMessage="No applications received in this date range"
            />
          </div>

          <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-[#8E8E88] flex items-center justify-between">
            <span>
              ℹ Note: Average time-in-stage requires timestamped stage transitions and will be enabled in a future database migration.
            </span>
          </div>
        </div>
      )}

      {/* Health Tab Content (Phase 5) */}
      {activeTab === 'health' && (
        <div className="space-y-8">
          {/* Web Vitals Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-cluster-acid" />
              <h2 className="text-sm font-mono font-semibold text-white tracking-wide">
                Core Web Vitals (75th Percentile)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* LCP Tile */}
              {(() => {
                const lcpMetric = healthData?.vitals?.lcp
                const val = lcpMetric?.p75
                const rating = val != null ? rateVital('LCP', val) : 'good'
                const displayVal = val != null ? (val > 10 ? `${(val / 1000).toFixed(2)}s` : `${val}s`) : '—'
                const badgeColor =
                  rating === 'good'
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    : rating === 'needs-improvement'
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    : 'text-rose-400 bg-rose-400/10 border-rose-400/20'

                return (
                  <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] relative">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono text-[#8E8E88]">Largest Contentful Paint</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border capitalize ${badgeColor}`}>
                        {rating.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tight">
                      {loading ? '…' : displayVal}
                    </div>
                    <div className="text-[11px] font-mono text-[#8E8E88] mt-2 flex items-center justify-between">
                      <span>Threshold: ≤ 2.5s</span>
                      <span>{lcpMetric?.count || 0} samples</span>
                    </div>
                  </div>
                )
              })()}

              {/* INP Tile */}
              {(() => {
                const inpMetric = healthData?.vitals?.inp
                const val = inpMetric?.p75
                const rating = val != null ? rateVital('INP', val) : 'good'
                const displayVal = val != null ? `${Math.round(val)}ms` : '—'
                const badgeColor =
                  rating === 'good'
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    : rating === 'needs-improvement'
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    : 'text-rose-400 bg-rose-400/10 border-rose-400/20'

                return (
                  <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] relative">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono text-[#8E8E88]">Interaction to Next Paint</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border capitalize ${badgeColor}`}>
                        {rating.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tight">
                      {loading ? '…' : displayVal}
                    </div>
                    <div className="text-[11px] font-mono text-[#8E8E88] mt-2 flex items-center justify-between">
                      <span>Threshold: ≤ 200ms</span>
                      <span>{inpMetric?.count || 0} samples</span>
                    </div>
                  </div>
                )
              })()}

              {/* CLS Tile */}
              {(() => {
                const clsMetric = healthData?.vitals?.cls
                const val = clsMetric?.p75
                const rating = val != null ? rateVital('CLS', val) : 'good'
                const displayVal = val != null ? Number(val).toFixed(3) : '—'
                const badgeColor =
                  rating === 'good'
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    : rating === 'needs-improvement'
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    : 'text-rose-400 bg-rose-400/10 border-rose-400/20'

                return (
                  <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] relative">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono text-[#8E8E88]">Cumulative Layout Shift</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border capitalize ${badgeColor}`}>
                        {rating.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tight">
                      {loading ? '…' : displayVal}
                    </div>
                    <div className="text-[11px] font-mono text-[#8E8E88] mt-2 flex items-center justify-between">
                      <span>Threshold: ≤ 0.100</span>
                      <span>{clsMetric?.count || 0} samples</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Errors & Content Freshness Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Error Telemetry */}
            <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08]">
              <div className="flex items-center gap-2 mb-4">
                <Bug className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                  Client Runtime & Route Errors
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-xs font-mono text-[#8E8E88]">JS Runtime Errors</div>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    {loading ? '…' : healthData?.js_errors ?? 0}
                  </div>
                  <div className="text-[11px] font-mono text-[#8E8E88]/60 mt-1">
                    window.onerror & unhandled rejections
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-xs font-mono text-[#8E8E88]">404 Not Found</div>
                  <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                    {loading ? '…' : healthData?.not_found_errors ?? 0}
                  </div>
                  <div className="text-[11px] font-mono text-[#8E8E88]/60 mt-1">
                    Dead link redirect hits
                  </div>
                </div>
              </div>

              {/* Top 404 Paths Table */}
              <div>
                <h4 className="text-xs font-mono font-semibold text-[#8E8E88] uppercase tracking-wider mb-3">
                  Top 404 Route Paths
                </h4>
                {(!healthData?.top_404 || healthData.top_404.length === 0) ? (
                  <div className="text-xs font-mono text-[#8E8E88]/60 p-4 border border-dashed border-white/[0.06] rounded-xl text-center">
                    No 404 errors recorded in this date range.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {healthData.top_404.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs font-mono p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                      >
                        <span className="text-white truncate max-w-[280px]" title={item.path}>
                          {item.path}
                        </span>
                        <span className="text-amber-400 font-semibold shrink-0 ml-2">
                          {item.count} hit{item.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Freshness */}
            <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08]">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-cluster-acid" />
                <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                  Content Freshness & Activity
                </h3>
              </div>
              <p className="text-xs font-mono text-[#8E8E88] mb-4">
                Last administrative modification timestamp per category recorded in database audit logs.
              </p>

              {freshnessByCategory.length === 0 ? (
                <div className="text-xs font-mono text-[#8E8E88]/60 p-6 border border-dashed border-white/[0.06] rounded-xl text-center">
                  No audit logs found for this date range.
                </div>
              ) : (
                <div className="space-y-3">
                  {freshnessByCategory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-white capitalize">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#8E8E88] border border-white/[0.05]">
                            {item.action}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#8E8E88] truncate mt-0.5" title={item.summary}>
                          {item.summary}
                        </p>
                      </div>
                      <div className="text-[11px] font-mono text-[#8E8E88] shrink-0 text-right">
                        {item.time ? new Date(item.time).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Retention Purge & Database Maintenance */}
          <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                    Analytics Retention Purge
                  </h3>
                </div>
                <p className="text-xs font-mono text-[#8E8E88] mt-1 max-w-xl">
                  Prune historical telemetry older than 90 days from <code>public.page_events</code> to bound table and index storage. Admin privileges required.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {purgeResult && (
                  <span
                    className={`text-xs font-mono ${
                      purgeResult.error ? 'text-rose-400' : 'text-cluster-acid'
                    }`}
                  >
                    {purgeResult.error
                      ? `Error: ${purgeResult.error}`
                      : `Purged ${purgeResult.count} events`}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handlePurge(90)}
                  disabled={purging}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-mono font-semibold transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{purging ? 'Purging…' : 'Purge > 90 Days'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
