export function Tabs({ activeTab = 'traffic', onChange }) {
  const tabs = [
    { id: 'traffic', label: 'Traffic' },
    { id: 'interest', label: 'Interest' },
    { id: 'funnel', label: 'Funnel' },
    { id: 'applicants', label: 'Applicants' },
    { id: 'health', label: 'Health' },
  ]

  return (
    <div className="flex items-center gap-1 border-b border-white/[0.08] overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono border-b-2 whitespace-nowrap transition-colors ${
              isActive
                ? 'border-cluster-acid text-white font-medium'
                : 'border-transparent text-[#8E8E88] hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.phase && (
              <span className="text-[10px] px-1.5 py-0.2 bg-white/5 rounded text-[#8E8E88]/70 border border-white/[0.05]">
                {tab.phase}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
