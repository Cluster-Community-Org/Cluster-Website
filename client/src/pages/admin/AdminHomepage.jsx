import { useState, useEffect } from 'react'
import {
  Bell,
  Star,
  Layers,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  FileSpreadsheet,
  Play,
} from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { useToast } from '../../context/ToastContext.jsx'
import { ClusterPreloader } from '../../components/ui/ClusterLoader.jsx'

export default function AdminHomepage() {
  const { showToast } = useToast()
  const [config, setConfig] = useState(() => clusterDataService.getHomepageConfig())
  const [events, setEvents] = useState(() => clusterDataService.getEvents())
  const [spotlight, setSpotlight] = useState(() => clusterDataService.getSpotlightEvent())
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [previewLoader, setPreviewLoader] = useState(false)

  useEffect(() => {
    const handleEventsUpdate = () => {
      setEvents(clusterDataService.getEvents())
      setSpotlight(clusterDataService.getSpotlightEvent())
    }
    const handleConfigUpdate = () => {
      setConfig(clusterDataService.getHomepageConfig())
    }

    window.addEventListener('cluster_events_updated', handleEventsUpdate)
    window.addEventListener('cluster_spotlight_updated', handleEventsUpdate)
    window.addEventListener('cluster_homepage_updated', handleConfigUpdate)

    return () => {
      window.removeEventListener('cluster_events_updated', handleEventsUpdate)
      window.removeEventListener('cluster_spotlight_updated', handleEventsUpdate)
      window.removeEventListener('cluster_homepage_updated', handleConfigUpdate)
    }
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    clusterDataService.updateHomepageConfig(config)
    setSavedSuccess(true)
    showToast('Homepage settings & banner copy updated successfully')
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleSpotlightSelect = (eventId) => {
    const active = clusterDataService.setSpotlightEvent(Number(eventId))
    setSpotlight(active)
    if (active) {
      showToast(`Spotlight event switched to "${active.title}"`)
    }
  }

  const handleStatChange = (index, field, value) => {
    const newStats = [...config.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setConfig({ ...config, stats: newStats })
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {previewLoader && (
        <ClusterPreloader
          forceShow={true}
          onComplete={() => setPreviewLoader(false)}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-cluster-acid" />
            <span>HOMEPAGE CONTENT & BANNER CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Homepage & Alert Settings
          </h1>
          <p className="text-xs text-[#8E8E88] font-sans mt-0.5">
            Configure the live announcement ticker, hero title & subtitle, society metrics, and active countdown spotlight.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cluster-acid/15 border border-cluster-acid/40 text-cluster-acid text-xs font-mono font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Changes Published!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Announcement Alert Banner */}
        <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-white/10 text-cluster-acid flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">Top Announcement Ticker</h3>
                <p className="text-xs text-[#8E8E88] font-sans">
                  Auto-announces the next upcoming event. The message below only shows when no event is scheduled.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto">
              <span className="text-xs font-mono text-[#D4D4CD]">
                {config.bannerEnabled ? 'Banner Active' : 'Banner Disabled'}
              </span>
              <input
                type="checkbox"
                checked={config.bannerEnabled}
                onChange={(e) => setConfig({ ...config, bannerEnabled: e.target.checked })}
                className="w-4 h-4 accent-cluster-acid rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#D4D4CD]">Announcement Message Text</label>
              <input
                type="text"
                value={config.bannerText}
                onChange={(e) => setConfig({ ...config, bannerText: e.target.value })}
                placeholder="e.g. ⚡ Kickstart '26 registrations are now open for tech students."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#D4D4CD]">Link Destination (URL / Path)</label>
                <input
                  type="text"
                  value={config.bannerLink}
                  onChange={(e) => setConfig({ ...config, bannerLink: e.target.value })}
                  placeholder="/events"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-mono placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#D4D4CD]">Button Label</label>
                <input
                  type="text"
                  value={config.bannerLinkText}
                  onChange={(e) => setConfig({ ...config, bannerLinkText: e.target.value })}
                  placeholder="Join In →"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                />
              </div>
            </div>

            {/* Live Banner Preview Box */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-mono text-[#8E8E88] uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cluster-acid" />
                <span>Live Banner Preview</span>
              </div>
              <div className="p-3 rounded-xl bg-black border border-cluster-acid/30 text-xs font-mono flex items-center justify-between text-white">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-sm bg-cluster-acid shrink-0" />
                  <span className="truncate">{config.bannerText || 'No message provided'}</span>
                  <span className="text-cluster-acid font-bold ml-1.5 shrink-0">
                    {config.bannerLinkText}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono ml-2">Preview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Active Spotlight Event Selector */}
        <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-black border border-white/10 text-cluster-acid flex items-center justify-center">
              <Star className="w-4 h-4 fill-cluster-acid" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Homepage Spotlight Countdown Event</h3>
              <p className="text-xs text-[#8E8E88] font-sans">
                Controls which event powers the live countdown timer on the public homepage.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#D4D4CD]">Select Spotlight Event</label>
              <select
                value={spotlight ? spotlight.id : ''}
                onChange={(e) => handleSpotlightSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-[#141517] text-white">
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </div>

            {spotlight && (
              <div className="p-4 rounded-xl bg-black border border-cluster-acid/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-cluster-acid font-bold uppercase tracking-wider">
                    CURRENTLY SPOTLIGHTED ON HOMEPAGE
                  </div>
                  <div className="text-white font-bold text-sm mt-0.5">{spotlight.title}</div>
                  <div className="text-[#8E8E88] text-[11px] mt-0.5">
                    {spotlight.date} · {spotlight.time} · {spotlight.location}
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-cluster-acid/15 border border-cluster-acid/40 text-cluster-acid text-center font-bold self-start sm:self-auto">
                  LIVE COUNTDOWN ACTIVE
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Hero Title, Subtitle & Live Society Metrics */}
        <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-white/10 text-cluster-acid flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">Hero Title, Subtitle & Society Metrics</h3>
                <p className="text-xs text-[#8E8E88] font-sans">
                  Customize the main hero title, lead subtitle, and toggle the metric counters on the public homepage.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto">
              <span className="text-xs font-mono text-[#D4D4CD]">
                {config.statsEnabled ? 'Metrics Visible' : 'Metrics Hidden'}
              </span>
              <input
                type="checkbox"
                checked={Boolean(config.statsEnabled)}
                onChange={(e) => setConfig({ ...config, statsEnabled: e.target.checked })}
                className="w-4 h-4 accent-cluster-acid rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-5">
            {/* Main Hero Headline (Title) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#D4D4CD] font-bold">Hero Main Headline (Title)</label>
                <span className="text-[11px] text-[#8E8E88] font-mono">Press Enter for line breaks</span>
              </div>
              <textarea
                rows={2}
                value={config.heroHeadline || ''}
                onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                placeholder={'Find your people.\nBuild together.'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-sm font-display font-bold placeholder-gray-500 focus:border-cluster-acid focus:outline-none resize-none leading-snug"
              />
              <p className="text-[11px] text-[#8E8E88] font-sans">
                Each line appears as a bold heading line on the homepage. Trailing periods are automatically colored with the signature brand dot.
              </p>
            </div>

            {/* Hero Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#D4D4CD] font-bold">Hero Lead Subtitle</label>
              <textarea
                rows={2}
                value={config.heroSubtitle || ''}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                placeholder="A student community around compute."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Live Hero Title Preview */}
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-mono text-[#8E8E88] uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cluster-acid" />
                <span>Live Hero Title & Subtitle Preview</span>
              </div>
              <div className="p-5 rounded-2xl bg-black border border-cluster-acid/30 space-y-2 text-white">
                <div className="text-2xl sm:text-3xl font-display font-black leading-tight text-white tracking-tight">
                  {(config.heroHeadline || 'Find your people.\nBuild together.').split(/\\n|\n/).map((line, idx, arr) => (
                    <div key={idx} className="block">
                      {idx === arr.length - 1 ? (
                        <>
                          {line.replace(/\.$/, '')}
                          <span className="text-cluster-acid font-bold">.</span>
                        </>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
                {config.heroSubtitle && (
                  <p className="text-xs font-sans text-[#A8A8A0] pt-1">
                    {config.heroSubtitle}
                  </p>
                )}
              </div>
            </div>

            {/* 4 Metric Counters Grid */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#D4D4CD]">4 Hero Metric Counters</label>
                {!config.statsEnabled && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Currently hidden on public hero
                  </span>
                )}
              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${!config.statsEnabled ? 'opacity-60' : 'opacity-100'}`}>
                {config.stats && config.stats.filter((s) => s && !s.__type).map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#141517] border border-white/[0.08] space-y-2"
                  >
                    <div className="text-[10px] font-mono text-cluster-acid uppercase font-bold">
                      Metric Card #{idx + 1}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                        placeholder="Value (e.g. 150+)"
                        className="px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-cluster-acid focus:outline-none"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                        placeholder="Label"
                        className="px-2.5 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-cluster-acid focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Google Sheets Recruitment Integration */}
        <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-black border border-white/10 text-cluster-acid flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Google Sheets Recruitment Sync</h3>
              <p className="text-xs text-[#8E8E88] font-sans">
                Automatically stream new student membership applications to a Google Sheet. Change this webhook yearly as you create new sheets.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#D4D4CD]">Google Apps Script Webhook URL</label>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  config.applicationsSheetUrl
                    ? 'text-cluster-acid bg-cluster-acid/10 border-cluster-acid/30'
                    : 'text-gray-400 bg-white/5 border-white/10'
                }`}>
                  {config.applicationsSheetUrl ? 'Sync Active' : 'Not Configured'}
                </span>
              </div>
              <input
                type="url"
                value={config.applicationsSheetUrl || ''}
                onChange={(e) => setConfig({ ...config, applicationsSheetUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-mono placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#8E8E88] font-sans leading-relaxed">
              Tip: You can also manage and test this webhook directly from the <strong className="text-white">Admin → Applications</strong> page.
            </p>
          </div>
        </div>

        {/* Section 5: Homepage Intro Loader Animation */}
        <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-white/10 text-cluster-acid flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">Cinematic Intro Preloader</h3>
                <p className="text-xs text-[#8E8E88] font-sans">
                  Branded emblem animation with sequential neon sparks, elastic bounce, and downward exit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                config.loaderEnabled !== false
                  ? 'text-cluster-acid bg-cluster-acid/10 border-cluster-acid/30'
                  : 'text-gray-400 bg-white/5 border-white/10'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.loaderEnabled !== false ? 'bg-cluster-acid' : 'bg-gray-500'}`} />
                {config.loaderEnabled !== false ? 'Loader Enabled' : 'Loader Disabled'}
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.loaderEnabled !== false}
                  onChange={(e) => setConfig({ ...config, loaderEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cluster-acid peer-checked:after:bg-black" />
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
            <div className="space-y-1">
              <p className="text-xs text-white font-medium">
                Visitor First-Impression Experience
              </p>
              <p className="text-[11px] text-[#8E8E88] font-sans leading-relaxed">
                Controls whether visitors to the public website experience the signature Cluster logo intro sequence. When enabled, it plays on production and local environments. Admin routes (<code className="text-[#C6FF4D] text-[10px]">/admin/*</code>) and tracking redirects (<code className="text-[#C6FF4D] text-[10px]">/r/*</code>) always bypass the loader for instantaneous workflow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPreviewLoader(true)}
              disabled={previewLoader}
              className="shrink-0 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cluster-acid/40 text-xs font-mono font-medium text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cluster-acid" />
              <span>{previewLoader ? 'Playing...' : 'Preview Animation'}</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="submit"
            className="btn-cluster-primary px-8 py-3 text-xs font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Publish Homepage Changes</span>
          </button>
        </div>
      </form>
    </div>
  )
}

