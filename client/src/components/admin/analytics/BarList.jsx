import { formatCompact, formatPct } from '../../../lib/analyticsFormat.js'

export function BarList({
  title,
  subtitle,
  items = [],
  valueKey = 'visitors',
  secondaryKey = 'pageviews',
  loading = false,
  emptyMessage = 'No data recorded',
}) {
  if (loading) {
    return (
      <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] animate-pulse space-y-4">
        <div className="h-4 w-28 bg-white/10 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const maxValue = items.length > 0 ? Math.max(...items.map((it) => Number(it[valueKey]) || 0), 1) : 1
  const totalValue = items.reduce((acc, it) => acc + (Number(it[valueKey]) || 0), 0)

  return (
    <div className="rounded-2xl p-6 bg-[#0F1012] border border-white/[0.08] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#8E8E88]">
            {title}
          </h4>
          <span className="text-[11px] font-mono text-[#8E8E88]/70">
            {formatCompact(totalValue)} total
          </span>
        </div>
        {subtitle && (
          <p className="text-xs font-mono text-[#8E8E88]/60 mb-4">{subtitle}</p>
        )}

        {items.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#8E8E88] border border-dashed border-white/[0.06] rounded-xl mt-3">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {items.map((item, idx) => {
              const val = Number(item[valueKey]) || 0
              const percent = Math.min(100, Math.round((val / maxValue) * 100))
              const share = totalValue > 0 ? Math.round((val / totalValue) * 100) : 0

              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-white truncate max-w-[200px] font-medium group-hover:text-cluster-acid transition-colors">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-white font-semibold">
                        {formatCompact(val)}
                      </span>
                      <span className="text-[#8E8E88] text-[10px] w-8 text-right">
                        {share}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cluster-acid/80 rounded-full transition-all duration-500 ease-out group-hover:bg-cluster-acid"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
