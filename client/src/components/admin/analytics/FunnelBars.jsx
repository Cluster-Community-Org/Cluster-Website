import { formatCompact, formatPct } from '../../../lib/analyticsFormat.js'
import { ArrowDown } from 'lucide-react'

export function FunnelBars({
  steps = {},
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const STAGE_CONFIG = [
    { key: 'view', label: '1. Visited /join Page', desc: 'Loaded application induction form' },
    { key: 'start', label: '2. Began Application', desc: 'Started typing or selected a track' },
    { key: 'projects', label: '3. Reached Work & Projects', desc: 'Reached GitHub/projects field' },
    { key: 'submit', label: '4. Submitted Application', desc: 'Successfully submitted credentials' },
  ]

  const topValue = Math.max(Number(steps?.view) || 1, 1)

  return (
    <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-6">
      <div>
        <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
          Recruitment Pipeline Funnel
        </h3>
        <p className="text-xs font-mono text-[#8E8E88] mt-0.5">
          Student journey from visiting the application form to completed induction submission
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {STAGE_CONFIG.map((stage, idx) => {
          const val = Number(steps?.[stage.key]) || 0
          const percentOfTotal = Math.min(100, Math.round((val / topValue) * 100))
          const prevVal = idx > 0 ? Number(steps?.[STAGE_CONFIG[idx - 1].key]) || 0 : val
          const stepConversion = prevVal > 0 ? Math.min(100, Math.round((val / prevVal) * 100)) : 0
          const dropOff = idx > 0 ? 100 - stepConversion : 0

          return (
            <div key={stage.key} className="space-y-2">
              {idx > 0 && (
                <div className="flex items-center gap-2 pl-4 text-[11px] font-mono text-[#8E8E88]">
                  <ArrowDown className="w-3.5 h-3.5 text-cluster-acid/70" />
                  <span>
                    {stepConversion}% progressed ({dropOff}% drop-off)
                  </span>
                </div>
              )}

              <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs font-mono">
                  <div>
                    <span className="text-white font-semibold block">{stage.label}</span>
                    <span className="text-[#8E8E88] text-[11px]">{stage.desc}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="text-lg font-bold text-white tabular-nums">
                      {formatCompact(val)}
                    </span>
                    <span className="text-cluster-acid font-medium text-xs w-12 text-right">
                      {percentOfTotal}%
                    </span>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cluster-acid rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentOfTotal}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
