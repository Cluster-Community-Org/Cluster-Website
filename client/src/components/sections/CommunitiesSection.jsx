import { Code2, BookOpen, Users } from 'lucide-react'

export default function CommunitiesSection() {
  return (
    <section className="py-20 bg-obsidian-900/50 border-y border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cluster-green/10 border border-cluster-green/30 text-cluster-green text-xs font-mono">
            <Users className="w-3.5 h-3.5" />
            <span>WHAT WE DO TOGETHER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            STUDENT-LED COMMUNITIES INSIDE CLUSTER
          </h2>
          <p className="text-sm text-gray-300 font-sans leading-relaxed">
            CLUSTER is home to focused communities where members go deeper on the things they care about.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="nvidia-card rounded-2xl p-8 space-y-4 flex flex-col justify-between border border-cluster-green/30 bg-obsidian-950/80 shadow-cluster-glow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cluster-green/10 border border-cluster-green/30 text-cluster-green flex items-center justify-center">
                <Code2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-cluster-green bg-cluster-green/10 px-2.5 py-1 rounded border border-cluster-green/20 font-bold inline-block">
                DEV & OPEN SOURCE
              </span>
              <h3 className="text-xl font-display font-bold text-white">
                Developer Circle
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Weekly code sessions, pair programming, open-source contributions, and project showcases. Whether you're building your first app or your tenth startup — there's a seat for you.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="nvidia-card rounded-2xl p-8 space-y-4 flex flex-col justify-between border border-cluster-cyan/30 bg-obsidian-950/80">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cluster-cyan/10 border border-cluster-cyan/30 text-cluster-cyan flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-cluster-cyan bg-cluster-cyan/10 px-2.5 py-1 rounded border border-cluster-cyan/20 font-bold inline-block">
                RESEARCH & AI
              </span>
              <h3 className="text-xl font-display font-bold text-white">
                AI & Research Society
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Study circles, paper reading groups, and hands-on ML projects. From classical ML to fine-tuning foundation models — learn through building and experimenting together.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="nvidia-card rounded-2xl p-8 space-y-4 flex flex-col justify-between border border-white/10 bg-obsidian-950/80">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/20 text-cluster-green flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono text-gray-300 bg-white/5 px-2.5 py-1 rounded border border-white/10 font-bold inline-block">
                COMMUNITY & GROWTH
              </span>
              <h3 className="text-xl font-display font-bold text-white">
                Peer Leadership Program
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
