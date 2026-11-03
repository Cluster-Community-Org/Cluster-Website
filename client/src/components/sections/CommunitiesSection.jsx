import { Code2, BookOpen, Users } from 'lucide-react'

export default function CommunitiesSection() {
  return (
    <section className="py-24 bg-[#080808] border-b border-white/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-display font-black text-[#F8F7F3] tracking-tight">
            COMMUNITIES INSIDE CLUSTER<span className="text-cluster-acid">.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#B5B5AE] font-sans leading-relaxed">
            Focused circles where builders go deep on the technologies that matter to them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="rounded-2xl p-8 space-y-5 flex flex-col justify-between bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/40 transition-all duration-200 group">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-black border border-white/[0.1] text-cluster-acid flex items-center justify-center group-hover:scale-105 group-hover:border-cluster-acid/50 transition-all">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono tracking-widest text-cluster-acid uppercase font-semibold">
                  DEV & OPEN SOURCE
                </div>
                <h3 className="text-xl font-display font-bold text-[#F8F7F3] group-hover:text-cluster-acid transition-colors">
                  Developer Circle
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#9E9E98] leading-relaxed font-sans">
                Weekly code sessions, pair programming, open-source contributions, and project showcases. Whether you're building your first app or your tenth startup — there's a seat for you.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl p-8 space-y-5 flex flex-col justify-between bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/40 transition-all duration-200 group">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-black border border-white/[0.1] text-cluster-acid flex items-center justify-center group-hover:scale-105 group-hover:border-cluster-acid/50 transition-all">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono tracking-widest text-[#B5B5AE] uppercase font-semibold">
                  COMPUTE & AI
                </div>
                <h3 className="text-xl font-display font-bold text-[#F8F7F3] group-hover:text-cluster-acid transition-colors">
                  Compute & ML Circle
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#9E9E98] leading-relaxed font-sans">
                Study circles, paper reading groups, and hands-on ML projects. From data pipelines to fine-tuning foundation models — learn through building and experimenting together.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl p-8 space-y-5 flex flex-col justify-between bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/40 transition-all duration-200 group">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-xl bg-black border border-white/[0.1] text-cluster-acid flex items-center justify-center group-hover:scale-105 group-hover:border-cluster-acid/50 transition-all">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono tracking-widest text-[#B5B5AE] uppercase font-semibold">
                  COMMUNITY & PEERS
                </div>
                <h3 className="text-xl font-display font-bold text-[#F8F7F3] group-hover:text-cluster-acid transition-colors">
                  Peer Leadership & Mentorship
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#9E9E98] leading-relaxed font-sans">
                Senior members mentor newcomers, run workshops, and build a culture where sharing knowledge is the norm. Leadership roles are earned by contribution, not seniority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
