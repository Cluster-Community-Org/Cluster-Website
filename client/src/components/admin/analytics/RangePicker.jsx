export function RangePicker({ value = 30, onChange }) {
  const options = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
  ]

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-[#0F1012] border border-white/[0.08]">
      {options.map((opt) => {
        const active = Number(value) === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 ${
              active
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-[#8E8E88] hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
