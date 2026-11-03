import { Code2, Lightbulb, Users, Rocket, Terminal } from 'lucide-react'

const PILLARS = [
  {
    icon: Code2,
    title: "Build Real Projects",
    desc: "Collaborate on student-led products — from web apps to embedded systems. Ship real software that solves real problems.",
    tag: "BUILD",
    accent: "text-cluster-green",
    border: "border-cluster-green/30",
    bg: "bg-cluster-green/10",
  },
  {
    icon: Lightbulb,
    title: "Learn Together",
    desc: "Workshops, study circles, and peer-led sessions on AI, web dev, cloud, and more — knowledge shared freely.",
    tag: "LEARN",
    accent: "text-cluster-cyan",
    border: "border-cluster-cyan/30",
    bg: "bg-cluster-cyan/10",
  },
  {
    icon: Users,
    title: "Collaborate Across Disciplines",
    desc: "Designers, developers, data scientists — all under one roof. Cross-functional teams build better things.",
    tag: "COLLABORATE",
    accent: "text-cluster-green",
    border: "border-cluster-green/20",
    bg: "bg-cluster-green/8",
  },
  {
    icon: Rocket,
    title: "Create the Future",
    desc: "Hackathons, competitions, and startup incubation. Turn your idea into a prototype and your prototype into a product.",
    tag: "CREATE",
    accent: "text-cluster-cyan",
    border: "border-cluster-cyan/20",
    bg: "bg-cluster-cyan/8",
  },
]

export default function AboutSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cluster-green/10 border border-cluster-green/30 text-cluster-green text-xs font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>WHAT WE STAND FOR</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
          POWERING THE NEXT GENERATION OF BUILDERS
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto font-sans">
          CLUSTER is a student technology society at Galgotias University built on four pillars that drive everything we do.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon
          return (
            <div key={idx} className="nvidia-card rounded-2xl p-6 space-y-4 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl ${pillar.bg} border ${pillar.border} flex items-center justify-center ${pillar.accent} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-mono ${pillar.accent} ${pillar.bg} px-2 py-0.5 rounded border ${pillar.border} inline-block`}>
                  {pillar.tag}
                </span>
                <h3 className={`text-xl font-display font-bold text-white group-hover:${pillar.accent} transition-colors`}>
                  {pillar.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {pillar.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
