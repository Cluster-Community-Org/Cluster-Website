import { Link } from 'react-router-dom'
import { Calendar, Users, Layers, TrendingUp, Plus, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Events', value: '20+', change: '+4 this month', icon: Calendar, color: 'text-cluster-green', border: 'border-cluster-green/40' },
    { label: 'Active Members', value: '150+', change: '+18 this week', icon: Users, color: 'text-cluster-cyan', border: 'border-cluster-cyan/40' },
    { label: 'Live Projects', value: '10+', change: '+2 active sprints', icon: Layers, color: 'text-cluster-green', border: 'border-cluster-green/20' },
    { label: 'Partner Orgs', value: '5+', change: 'All active', icon: TrendingUp, color: 'text-white', border: 'border-white/20' },
  ]

  const recentActivity = [
    { title: 'New RSVP registered for CLUSTER Hackathon S1', time: '12 mins ago', type: 'event' },
    { title: 'Team member bio updated: Alwin Mathew', time: '1 hour ago', type: 'team' },
    { title: 'Spotlight Event updated to CLUSTER Hackathon S1', time: '3 hours ago', type: 'system' },
    { title: 'New application received for Developer Circle', time: 'Yesterday', type: 'member' },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Welcome to CLUSTER CMS
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-sans mt-1">
            Real-time management dashboard for events, team, and society resources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/events"
            className="btn-cluster-primary px-4 py-2.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </Link>
          <Link
            to="/admin/team"
            className="btn-cluster-secondary px-4 py-2.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-cluster-green" />
            <span>Add Member</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className={`nvidia-card rounded-2xl p-5 border ${s.border} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-obsidian-950 border border-white/10 flex items-center justify-center text-cluster-green">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cluster-green" />
                <span>{s.change}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two-Column Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Nav Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
            <span>Management Modules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/events"
              className="nvidia-card rounded-2xl p-6 border border-cluster-green/30 hover:border-cluster-green space-y-4 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cluster-green/10 border border-cluster-green/30 text-cluster-green flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cluster-green transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-cluster-green transition-colors">
                  Events & Hackathons
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Schedule upcoming workshops, hackathons, and manage past event photo galleries.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/team"
              className="nvidia-card rounded-2xl p-6 border border-cluster-cyan/30 hover:border-cluster-cyan space-y-4 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cluster-cyan/10 border border-cluster-cyan/30 text-cluster-cyan flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cluster-cyan transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-white group-hover:text-cluster-cyan transition-colors">
                  Executive Board & Team
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Update officer profiles, graduation years, leadership bios, and GitHub/LinkedIn URLs.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity (1 col) */}
        <div className="nvidia-card rounded-2xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cluster-green" />
              <span>Recent Activity</span>
            </h2>

            <div className="space-y-3">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="pb-3 border-b border-white/5 last:border-none space-y-1">
                  <p className="text-xs text-gray-200 font-sans leading-relaxed">
                    {act.title}
                  </p>
                  <span className="text-[10px] font-mono text-gray-400">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-center">
            <span className="text-[11px] font-mono text-cluster-green">All society services nominal</span>
          </div>
        </div>
      </div>
    </div>
  )
}

