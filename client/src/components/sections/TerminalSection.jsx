import { Terminal } from 'lucide-react'
import InteractiveTerminal from '../3d/Terminal/InteractiveTerminal.jsx'

export default function TerminalSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" aria-label="Terminal section">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cluster-green/10 border border-cluster-green/30 text-cluster-green text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>INTERACT WITH CLUSTER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            EXPLORE THE CLUSTER TERMINAL
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto font-sans">
            Type <code className="text-cluster-green font-mono font-bold">'help'</code> in the interactive terminal below to explore CLUSTER commands and club info.
          </p>
        </div>

        <div className="p-2 sm:p-4 rounded-2xl bg-obsidian-900 border border-cluster-green/25 shadow-cluster-glow relative">
          <InteractiveTerminal />
        </div>
      </div>
    </section>
  )
}
