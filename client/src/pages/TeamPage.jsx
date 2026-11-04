import { useState, useEffect } from 'react'
import { Github, Linkedin, Users, Sparkles, Award } from 'lucide-react'
import { clusterDataService } from '../services/clusterDataService.js'

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(() => clusterDataService.getTeamMembers())

  useEffect(() => {
    setTeamMembers(clusterDataService.getTeamMembers())
    const handleUpdate = () => {
      setTeamMembers(clusterDataService.getTeamMembers())
    }
    window.addEventListener('cluster_team_updated', handleUpdate)
    return () => window.removeEventListener('cluster_team_updated', handleUpdate)
  }, [])
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="text-xs font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-cluster-acid" />
          <span>TEAM & LEADERSHIP</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-black text-[#F8F7F3] tracking-tight leading-tight">
          A COMMUNITY AROUND COMPUTE.<br />
          <span className="text-cluster-gradient">FIND YOUR PEOPLE.</span>
        </h1>
        <p className="text-[#B5B5AE] text-base leading-relaxed font-sans">
          Good things happen in clusters. Bringing together passionate student builders, designers, and researchers —
          united by a shared drive to <span className="text-cluster-acid font-semibold">build together</span>.
        </p>
      </div>

      {/* Mission & Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="nvidia-card rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cluster-acid/10 border border-cluster-acid/40 text-cluster-acid flex items-center justify-center shadow-cluster-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">Our Mission</h2>
          <p className="text-gray-200 text-sm leading-relaxed">
            CLUSTER exists to democratize access to compute, peer learning, and hands-on builder culture. 
            We bring together students to build real projects, learn practical skills, 
            collaborate across teams, and explore emerging technologies.
          </p>
        </div>

        <div className="nvidia-card rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/20 text-cluster-acid flex items-center justify-center shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">Student-First Community</h2>
          <p className="text-gray-200 text-sm leading-relaxed">
            Every decision we make is guided by what's best for our members. Leadership is earned by contribution, 
            knowledge is shared freely, and every student — regardless of background or year — 
            has a place in CLUSTER.
          </p>
        </div>
      </div>

      {/* Leadership Team Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-cluster-acid uppercase font-semibold">EXECUTIVE BOARD</span>
          <h2 className="text-3xl font-display font-bold text-white">CLUSTER STUDENT OFFICERS</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="nvidia-card rounded-2xl overflow-hidden p-5 space-y-4 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="relative h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                  {/* Avatar badge */}
                  <div className="w-20 h-20 rounded-2xl bg-obsidian-900 border border-cluster-acid/40 text-cluster-acid flex items-center justify-center text-2xl font-display font-bold shadow-cluster-glow">
                    {member.initials}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-obsidian-900 border border-cluster-acid/30 text-[10px] font-mono text-cluster-acid font-semibold">
                    CLASS OF {member.graduationYear}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-mono text-cluster-acid font-medium mt-0.5">
                    {member.role}
                  </p>
                </div>

                <p className="text-xs text-gray-200 line-clamp-3 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-3 text-gray-300">
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="hover:text-cluster-acid transition-colors" aria-label="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-cluster-green transition-colors" aria-label="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
