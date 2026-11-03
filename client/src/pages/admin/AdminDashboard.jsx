import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, Layers, TrendingUp, Plus, ArrowUpRight, Clock, CheckCircle2, UserCheck, Star } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'

export default function AdminDashboard() {
  const [data, setData] = useState({
    events: clusterDataService.getEvents(),
    spotlight: clusterDataService.getSpotlightEvent(),
    team: clusterDataService.getTeamMembers(),
    applications: clusterDataService.getApplications(),
  })

  useEffect(() => {
    const refresh = () => {
      setData({
        events: clusterDataService.getEvents(),
        spotlight: clusterDataService.getSpotlightEvent(),
        team: clusterDataService.getTeamMembers(),
        applications: clusterDataService.getApplications(),
      })
    }

    window.addEventListener('cluster_events_updated', refresh)
    window.addEventListener('cluster_spotlight_updated', refresh)
    window.addEventListener('cluster_team_updated', refresh)
    window.addEventListener('cluster_applications_updated', refresh)

    return () => {
      window.removeEventListener('cluster_events_updated', refresh)
      window.removeEventListener('cluster_spotlight_updated', refresh)
      window.removeEventListener('cluster_team_updated', refresh)
      window.removeEventListener('cluster_applications_updated', refresh)
    }
  }, [])

  const pendingApps = data.applications.filter((a) => a.status === 'Pending').length

  const stats = [
    {
      label: 'Published Events',
      value: String(data.events.length),
      change: data.spotlight ? `Spotlight: ${data.spotlight.title.slice(0, 18)}...` : 'None active',
      icon: Calendar,
      color: 'text-cluster-acid',
      border: 'border-cluster-acid/40',
    },
    {
      label: 'Executive Officers',
      value: String(data.team.length),
      change: 'Active Leadership Roster',
      icon: Users,
      color: 'text-white',
      border: 'border-white/15',
    },
    {
      label: 'Membership Applicants',
      value: String(data.applications.length),
      change: `${pendingApps} pending review`,
      icon: UserCheck,
      color: 'text-cluster-acid',
      border: 'border-cluster-acid/30',
    },
    {
      label: 'Platform Status',
      value: 'Online',
      change: 'Reactive Client Sync Active',
      icon: CheckCircle2,
      color: 'text-white',
      border: 'border-white/10',
    },
  ]

  const recentActivity = [
    {
      title: data.spotlight ? `Homepage spotlight set to "${data.spotlight.title}"` : 'No active spotlight',
      time: 'Real-time',
      type: 'system',
    },
    {
      title: data.applications.length > 0 ? `Latest applicant: ${data.applications[0].fullName} (${data.applications[0].domain})` : 'No applications logged yet',
      time: 'Recruitment',
      type: 'member',
    },
    {
      title: `${data.events.length} events scheduled in public directory`,
      time: 'Events',
      type: 'event',
    },
    {
      title: `${data.team.length} officers on executive board`,
      time: 'Governance',
      type: 'team',
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Welcome to CLUSTER CMS
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E88] font-sans mt-1">
            Real-time management dashboard for events, team, membership applications, and homepage spotlight.
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
            to="/admin/applications"
            className="btn-cluster-secondary px-4 py-2.5 text-xs flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-cluster-acid" />
            <span>Applications ({pendingApps})</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className={`nvidia-card rounded-2xl p-5 border ${s.border} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8E8E88] uppercase tracking-wider">{s.label}</span>
                <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-cluster-acid">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[11px] font-mono text-[#8E8E88] flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-cluster-acid" />
                <span className="truncate">{s.change}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/events"
              className="nvidia-card rounded-2xl p-5 border border-cluster-acid/30 hover:border-cluster-acid space-y-3 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cluster-acid transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  Events & Spotlight
                </h3>
                <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                  Manage public schedule, promote events to the live spotlight countdown timer.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/applications"
              className="nvidia-card rounded-2xl p-5 border border-cluster-acid/30 hover:border-cluster-acid space-y-3 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cluster-acid transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  Recruitment Pipeline
                </h3>
                <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                  Review student membership applications, advance candidates, and export CSVs.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/team"
              className="nvidia-card rounded-2xl p-5 border border-white/10 hover:border-cluster-acid space-y-3 group transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-cluster-acid flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-cluster-acid transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white group-hover:text-cluster-acid transition-colors">
                  Executive Board
                </h3>
                <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                  Update officer profiles, graduation years, roles, and professional links.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Activity & System Health (1 col) */}
        <div className="nvidia-card rounded-2xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cluster-acid" />
              <span>Live System State</span>
            </h2>

            <div className="space-y-3">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="pb-3 border-b border-white/5 last:border-none space-y-1">
                  <p className="text-xs text-gray-200 font-sans leading-relaxed">
                    {act.title}
                  </p>
                  <span className="text-[10px] font-mono text-[#8E8E88]">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-center">
            <span className="text-[11px] font-mono text-cluster-acid">● All society CMS services active</span>
          </div>
        </div>
      </div>
    </div>
  )
}

