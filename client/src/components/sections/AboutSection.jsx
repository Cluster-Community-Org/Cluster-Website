import { Users, Cpu, Compass, Flame, Sparkles } from 'lucide-react'

const PILLARS = [
  {
    icon: Users,
    title: "Community",
    desc: "Find your people. A welcoming, high-energy environment for tech students who care deeply about building and engineering.",
    tag: "FIND YOUR PEOPLE",
    border: "border-cluster-acid/40",
  },
  {
    icon: Cpu,
    title: "Collaboration",
    desc: "Build together. Cross-disciplinary teams working on real-world software, AI compute models, and open-source initiatives.",
    tag: "BUILD TOGETHER",
    border: "border-white/10",
  },
  {
    icon: Compass,
    title: "Belonging",
    desc: "An inclusive space for every level of builder — from curious beginners writing their first scripts to experienced architects.",
    tag: "INCLUSIVE SPACE",
    border: "border-white/10",
  },
  {
    icon: Flame,
    title: "Shared Curiosity",
    desc: "Driven by what's next. Diving deep into modern compute, intelligent systems, full-stack ecosystems, and rapid prototyping.",
    tag: "EXPLORE COMPUTE",
    border: "border-cluster-acid/30",
  },
]

export default function AboutSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BRAND IDENTITY & CORE VALUES</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
          GOOD THINGS HAPPEN IN CLUSTERS.
        </h2>
        <p className="text-gray-300 text-sm max-w-xl mx-auto font-sans">
          A community around compute. Built on four foundational values that guide how we learn, collaborate, and build.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon
          return (
            <div
              key={idx}
              className={`nvidia-card rounded-2xl p-6 space-y-4 flex flex-col justify-between border ${pillar.border} group`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-obsidian-900 border border-white/10 text-cluster-acid flex items-center justify-center group-hover:scale-110 group-hover:border-cluster-acid transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-cluster-acid bg-cluster-acid/10 px-2 py-0.5 rounded border border-cluster-acid/20 inline-block font-semibold">
                  {pillar.tag}
                </span>
                <h3 className="text-xl font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono text-gray-400 group-hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid" />
                <span>CLUSTER // {pillar.title.toUpperCase()}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
