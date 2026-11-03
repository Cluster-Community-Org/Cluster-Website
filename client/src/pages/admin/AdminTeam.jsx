import { useState } from 'react'
import { Plus, Edit2, Trash2, Users, Github, Linkedin, X, Search } from 'lucide-react'

const INITIAL_TEAM = [
  {
    id: 1,
    name: 'President',
    role: 'Club Founder & President',
    graduationYear: '2026',
    bio: 'Founded CLUSTER to build a student technology community. Passionate about open-source software, developer communities, and making tech accessible to everyone.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 2,
    name: 'Vice President',
    role: 'AI & Research Lead',
    graduationYear: '2026',
    bio: 'Leads the AI & ML study circle and research projects. Specializes in building machine learning pipelines and mentoring members from beginner to practitioner level.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 3,
    name: 'Technical Secretary',
    role: 'Engineering & Dev Lead',
    graduationYear: '2027',
    bio: 'Heads the Developer Circle — organizing hackathons, code sprints, and open-source contribution sessions. Expert in full-stack development and system design.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 4,
    name: 'Events Director',
    role: 'Events & Community Coordinator',
    graduationYear: '2027',
    bio: 'Organizes workshops, competitions, and community events that bring CLUSTER members together. Coordinates partnerships with external organizations and sponsors.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
]

export default function AdminTeam() {
  const [team, setTeam] = useState(INITIAL_TEAM)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    graduationYear: '2026',
    bio: '',
    github: '',
    linkedin: '',
  })

  const filteredTeam = team.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingMember(null)
    setFormData({
      name: '',
      role: '',
      graduationYear: '2027',
      bio: '',
      github: '',
      linkedin: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (m) => {
    setEditingMember(m)
    setFormData({ ...m })
    setModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this officer?')) {
      setTeam(team.filter((m) => m.id !== id))
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (editingMember) {
      setTeam(team.map((m) => (m.id === editingMember.id ? { ...m, ...formData } : m)))
    } else {
      setTeam([{ ...formData, id: Date.now() }, ...team])
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Team & Leadership CMS</h1>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Manage executive board profiles, officer roles, and contact links.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-cluster-primary px-4 py-2.5 text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search officers by name or role..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-white placeholder-gray-500 text-xs font-mono focus:border-cluster-acid focus:outline-none"
        />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTeam.map((m) => (
          <div key={m.id} className="nvidia-card rounded-2xl p-5 border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cluster-acid bg-cluster-acid/10 px-2 py-0.5 rounded border border-cluster-acid/30">
                  CLASS OF {m.graduationYear}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1 rounded bg-obsidian-900 text-gray-400 hover:text-cluster-acid"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1 rounded bg-obsidian-900 text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-white text-base">{m.name}</h3>
                <p className="text-xs font-mono text-cluster-acid mt-0.5">{m.role}</p>
              </div>

              <p className="text-xs text-gray-300 font-sans line-clamp-3 leading-relaxed">
                {m.bio}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-gray-400 text-xs">
              {m.github && (
                <a href={m.github} target="_blank" rel="noopener noreferrer" className="hover:text-cluster-acid">
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
              {m.linkedin && (
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-cluster-acid">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-obsidian-900 border border-cluster-acid/40 rounded-2xl p-6 shadow-cluster-glow space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-bold text-lg text-white">
                {editingMember ? 'Edit Officer Profile' : 'Add New Officer'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-gray-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300">Society Role / Title</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300">Graduation Year</label>
                  <input
                    type="text"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300">Short Bio</label>
                <textarea
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-white focus:border-cluster-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cluster-primary px-5 py-2 text-xs"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

