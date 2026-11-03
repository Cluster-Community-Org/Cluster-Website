import { Code2, BookOpen, Users, Cpu } from 'lucide-react'

export default function CommunitiesSection() {
  return (
    <section className="py-20 bg-black/60 border-y border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>FOCUSED CIRCLES // COMPUTE & BUILD</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            COMMUNITIES INSIDE CLUSTER
          </h2>
          <p className="text-sm text-gray-300 font-sans leading-relaxed">
            Focused circles where builders go deep on the technologies that matter to them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="nvidia-card rounded-2xl p-8 space-y-4 flex flex-col justify-between border border-cluster-acid/30 bg-obsidian-900/80 shadow-cluster-glow group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-cluster-acid bg-cluster-acid/10 px-2.5 py-1 rounded border border-cluster-acid/20 font-bold inline-block">
                DEV & OPEN SOURCE
              </span>
              <h3 className="text-xl font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                Developer Circle
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Weekly code sessions, pair programming, open-source contributions, and project showcases. Whether you're building your first app or your tenth startup — there's a seat for you.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="nvidia-card rounded-2xl p-8 space-y-4 flex flex-col justify-between border border-white/10 bg-obsidian-900/80 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 text-cluster-acid flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-gray-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold inline-block">
                COMPUTE & AI
              </span>
              <h3 className="text-xl font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                Compute & ML Circle
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Study circles, paper reading groups, and hands-on ML projects. From data pipelines to fine-tuning foundation models — learn through building and experimenting together.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="nvidia-card rounded-2xl p-8 space-y-4 flex flex-col justify-between border border-white/10 bg-obsidian-900/80 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 text-cluster-acid flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-gray-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold inline-block">
                COMMUNITY & PEERS
              </span>
              <h3 className="text-xl font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                Peer Leadership & Mentorship
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Senior members mentor newcomers, run workshops, and build a culture where sharing knowledge is the norm. Leadership roles are earned by contribution, not seniority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
