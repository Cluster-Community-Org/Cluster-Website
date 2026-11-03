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
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]">
      <div className="space-y-4 mb-16 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-display font-black text-[#F8F7F3] tracking-tight leading-tight">
          GOOD THINGS HAPPEN IN CLUSTERS<span className="text-cluster-acid">.</span>
        </h2>
        <p className="text-[#B5B5AE] text-sm sm:text-base font-sans leading-relaxed">
          A community around compute. Built on four foundational values that guide how we learn, collaborate, and ship software together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon
          return (
            <div
              key={idx}
              className="rounded-2xl p-7 flex flex-col justify-between bg-[#0F1012] border border-white/[0.08] hover:border-cluster-acid/40 transition-all duration-200 group"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-black border border-white/[0.1] text-cluster-acid flex items-center justify-center group-hover:scale-105 group-hover:border-cluster-acid/50 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono tracking-widest text-cluster-acid uppercase font-semibold">
                    {pillar.tag}
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#F8F7F3] group-hover:text-cluster-acid transition-colors">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-[#9E9E98] text-xs sm:text-sm font-sans leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-white/[0.06] flex items-center gap-2 text-[10px] font-mono text-[#666660] group-hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-sm bg-cluster-acid/70" />
                <span>CLUSTER // {pillar.title.toUpperCase()}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
