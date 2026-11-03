import { Users, Calendar, Layers, Globe } from 'lucide-react'

const STATS = [
  {
    icon: Users,
    value: '150+',
    label: 'ACTIVE MEMBERS',
    color: 'text-cluster-green',
    border: 'border-cluster-green/40 shadow-cluster-glow',
    iconBg: 'bg-cluster-green/10 border-cluster-green/25 text-cluster-green',
  },
  {
    icon: Calendar,
    value: '20+',
    label: 'EVENTS HOSTED',
    color: 'text-cluster-cyan',
    border: 'border-cluster-cyan/30',
    iconBg: 'bg-cluster-cyan/10 border-cluster-cyan/25 text-cluster-cyan',
  },
  {
    icon: Layers,
    value: '10+',
    label: 'LIVE PROJECTS',
    color: 'text-cluster-green',
    border: 'border-white/10',
    iconBg: 'bg-cluster-green/8 border-cluster-green/20 text-cluster-green',
  },
  {
    icon: Globe,
    value: '5+',
    label: 'PARTNERS',
    color: 'text-white',
    border: 'border-white/10',
    iconBg: 'bg-white/5 border-white/15 text-white',
  },
]

export default function StatsSection() {
  return (
    <section className="py-20 bg-obsidian-900/40 border-y border-white/5 relative overflow-hidden" aria-labelledby="stats-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-cluster-acid" />
            <span>CLUSTER METRICS</span>
          </div>
          <h2 id="stats-heading" className="text-3xl sm:text-5xl font-display font-black text-[#F8F7F3] tracking-tight">
            SOCIETY IMPACT & NUMBERS
          </h2>
          <p className="text-[#B5B5AE] text-sm sm:text-base font-sans">
            Empowering student builders, creators, and collaborators to build real-world technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className={`nvidia-card rounded-2xl p-6 space-y-4 flex flex-col justify-between border ${stat.border}`}>
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`text-4xl font-bold font-mono ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-mono text-gray-400 tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
