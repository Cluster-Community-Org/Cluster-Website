import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export function KpiTile({
  title,
  value,
  delta,
  subtitle,
  loading = false,
  badge,
  unit = '',
  invertTrend = false,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] animate-pulse space-y-3">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="h-8 w-32 bg-white/10 rounded" />
        <div className="h-3 w-20 bg-white/5 rounded" />
      </div>
    )
  }

  const isPositive = delta !== null && delta !== undefined && delta > 0
  const isNegative = delta !== null && delta !== undefined && delta < 0
  const isNeutral = delta === 0

  // For bounce rate, a decrease is generally good
  const isGood = invertTrend ? isNegative : isPositive
  const isBad = invertTrend ? isPositive : isNegative

  return (
    <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] relative group hover:border-white/[0.15] transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-[#8E8E88]">
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#8E8E88] border border-white/[0.06]">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
          {value ?? '—'}
        </span>
        {unit && <span className="text-xs font-mono text-[#8E8E88]">{unit}</span>}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono">
        {delta !== null && delta !== undefined ? (
          <div
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
              isGood
                ? 'bg-emerald-500/10 text-emerald-400'
                : isBad
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-white/5 text-[#8E8E88]'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" />}
            {isNeutral && <Minus className="w-3 h-3" />}
            <span>
              {isPositive ? `+${delta}%` : `${delta}%`}
            </span>
          </div>
        ) : (
          <span className="text-[#8E8E88] text-[11px]">—</span>
        )}
        {subtitle && <span className="text-[#8E8E88] truncate">{subtitle}</span>}
      </div>
    </div>
  )
}
