import { useState, useEffect } from 'react'
import {
  Share2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Globe,
  Rocket,
  Calendar,
  Users,
  Sparkles,
  X,
  Check,
  QrCode,
  Smartphone,
  Copy,
} from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'
import { useToast } from '../../context/ToastContext.jsx'
import { getSafeUrl } from '../../lib/safeUrl.js'

// Brand Icons Helper
function BrandIconPreview({ type, className = 'w-5 h-5' }) {
  switch (type) {
    case 'discord':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className}>
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'x':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className}>
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      )
    case 'github':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className}>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )
    case 'globe':
      return <Globe className={className} />
    case 'rocket':
      return <Rocket className={className} />
    case 'calendar':
      return <Calendar className={className} />
    case 'users':
      return <Users className={className} />
    default:
      return <Globe className={className} />
  }
}

const CATEGORIES = ['All', 'Enabled Only', 'Disabled Only', 'Featured', 'Community', 'Socials', 'Developer']

const ICON_OPTIONS = [
  { value: 'globe', label: 'Globe / Website' },
  { value: 'rocket', label: 'Rocket / Apply' },
  { value: 'calendar', label: 'Calendar / Events' },
  { value: 'discord', label: 'Discord Server' },
  { value: 'whatsapp', label: 'WhatsApp Community' },
  { value: 'linkedin', label: 'LinkedIn Company' },
  { value: 'instagram', label: 'Instagram Profile' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'github', label: 'GitHub Repos' },
  { value: 'users', label: 'Users / Team' },
]

const COLOR_PRESETS = [
  { label: 'Acid Lime (Brand)', value: 'bg-[#C6FF4D] text-black border-2 border-black hover:bg-[#b5f533]' },
  { label: 'NVIDIA Green', value: 'bg-[#76B900] text-black border-2 border-black hover:bg-[#68a500]' },
  { label: 'Discord Blurple', value: 'bg-[#5865F2] text-white border-2 border-black hover:bg-[#4752c4]' },
  { label: 'WhatsApp Green', value: 'bg-[#25D366] text-white border-2 border-black hover:bg-[#20b858]' },
  { label: 'LinkedIn Blue', value: 'bg-[#0A66C2] text-white border-2 border-black hover:bg-[#084e96]' },
  { label: 'Instagram Berry', value: 'bg-[#E4405F] text-white border-2 border-black hover:bg-[#d63251]' },
  { label: 'Event Indigo', value: 'bg-[#6366F1] text-white border-2 border-black hover:bg-[#5254d8]' },
  { label: 'Team Sky Blue', value: 'bg-[#0EA5E9] text-white border-2 border-black hover:bg-[#0284c7]' },
  { label: 'GitHub Dark', value: 'bg-[#24292E] text-white border-2 border-black hover:bg-[#1a1e22]' },
  { label: 'Pure Black (X)', value: 'bg-[#000000] text-white border-2 border-white/20 hover:bg-[#181818]' },
]

export default function AdminSocials() {
  const { showToast } = useToast()
  const [links, setLinks] = useState(() => clusterDataService.getSocialLinks())
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingLink, setEditingLink] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sync state reactively
  useEffect(() => {
    const handleUpdate = () => {
      setLinks(clusterDataService.getSocialLinks())
    }
    window.addEventListener('cluster_socials_updated', handleUpdate)
    return () => window.removeEventListener('cluster_socials_updated', handleUpdate)
  }, [])

  // Toggle enable/disable
  const handleToggle = (id, e) => {
    e.stopPropagation()
    const updated = clusterDataService.toggleSocialLink(id)
    setLinks(updated)
    const target = updated.find((l) => l.id === id)
    showToast(
      target?.enabled !== false
        ? `"${target?.title}" is now ACTIVE on Linktree`
        : `"${target?.title}" is now HIDDEN from Linktree`,
      target?.enabled !== false ? 'success' : 'info'
    )
  }

  // Delete link
  const handleDelete = (id, title) => {
    if (confirm(`Remove "${title}" from the Linktree socials list?`)) {
      const updated = clusterDataService.deleteSocialLink(id)
      setLinks(updated)
      showToast(`Link "${title}" deleted`, 'info')
    }
  }

  // Move up/down
  const handleMove = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= links.length) return
    const reordered = [...links]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    const withOrder = reordered.map((l, i) => ({ ...l, order: i + 1 }))
    const saved = clusterDataService.updateSocialLinks(withOrder)
    setLinks(saved)
    showToast('Link order updated')
  }

  // Reset to default links
  const handleResetDefaults = () => {
    if (confirm('Reset all social links back to society defaults? Custom links will be replaced.')) {
      const reset = clusterDataService.resetSocialLinks()
      setLinks(reset)
      showToast('Restored default social links', 'success')
    }
  }

  // Open modal for new link
  const handleOpenAdd = () => {
    setEditingLink({
      id: '',
      title: '',
      subtitle: '',
      url: 'https://',
      iconType: 'globe',
      category: 'Community',
      bgClass: COLOR_PRESETS[0].value,
      badge: '',
      enabled: true,
    })
    setIsModalOpen(true)
  }

  // Open modal for editing
  const handleOpenEdit = (link) => {
    setEditingLink({ ...link })
    setIsModalOpen(true)
  }

  // Save link from modal
  const handleSaveModal = (e) => {
    e.preventDefault()
    if (!editingLink.title.trim()) {
      showToast('Please enter a link title', 'error')
      return
    }
    if (!editingLink.url.trim() || !editingLink.url.startsWith('http')) {
      showToast('Please provide a valid URL starting with http:// or https://', 'error')
      return
    }

    const updated = clusterDataService.saveSocialLink(editingLink)
    setLinks(updated)
    setIsModalOpen(false)
    showToast(`Saved "${editingLink.title}" successfully!`, 'success')
  }

  // Filtered links
  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      (link.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (link.subtitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (link.url || '').toLowerCase().includes(search.toLowerCase())

    let matchesCategory = true
    if (selectedCategory === 'Enabled Only') {
      matchesCategory = link.enabled !== false
    } else if (selectedCategory === 'Disabled Only') {
      matchesCategory = link.enabled === false
    } else if (selectedCategory !== 'All') {
      matchesCategory = link.category === selectedCategory
    }

    return matchesSearch && matchesCategory
  })

  // Counters
  const totalCount = links.length
  const enabledCount = links.filter((l) => l.enabled !== false).length
  const disabledCount = totalCount - enabledCount

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-cluster-acid" />
            <span>COMMUNITY HUBS & LINKTREE CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Linktree & Socials Control
          </h1>
          <p className="text-xs text-[#8E8E88] font-sans mt-0.5">
            Toggle, reorder, and control which social channels and links appear live on the public Linktree page.
          </p>
        </div>

        {/* Header Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Open Linktree preview in browser */}
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all group"
            title="Open Live Linktree Hub"
          >
            <Smartphone className="w-4 h-4 text-cluster-acid" />
            <span>Open Linktree Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
          </a>

          {/* Add New Link */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cluster-acid text-black font-bold text-xs font-mono transition-transform hover:scale-105 active:scale-95 shadow-md shadow-cluster-acid/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Social Link</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
            title="Reset to default society links"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#0F1012] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E88]">Total Configured</div>
            <div className="text-xl sm:text-2xl font-display font-black text-white mt-0.5">{totalCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Share2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1012] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E88]">Active on Linktree</div>
            <div className="text-xl sm:text-2xl font-display font-black text-cluster-acid mt-0.5">{enabledCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 flex items-center justify-center text-cluster-acid">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1012] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E88]">Disabled / Hidden</div>
            <div className="text-xl sm:text-2xl font-display font-black text-gray-400 mt-0.5">{disabledCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
            <EyeOff className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: Management List (Left) + Phone Preview Mockup (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Socials Manager (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar: Search & Category Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, handle, or URL..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1012] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-bold shadow'
                      : 'bg-white/5 hover:bg-white/10 text-[#8E8E88] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-3">
            {filteredLinks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0F1012] border border-white/[0.08] space-y-2">
                <Share2 className="w-8 h-8 text-gray-600 mx-auto" />
                <div className="text-white font-display font-bold">No social links found</div>
                <p className="text-xs text-gray-500 font-sans">
                  Try adjusting your search or select another category filter.
                </p>
              </div>
            ) : (
              filteredLinks.map((link, idx) => {
                const isEnabled = link.enabled !== false
                return (
                  <div
                    key={link.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
                      isEnabled
                        ? 'bg-[#0F1012] border-white/[0.1] hover:border-cluster-acid/40'
                        : 'bg-white/[0.02] border-white/[0.05] opacity-60'
                    }`}
                  >
                    {/* Left: Icon & Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Icon preview box */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-black/30 shadow-md ${link.bgClass || 'bg-black text-white'}`}
                      >
                        <BrandIconPreview type={link.iconType} className="w-5 h-5" />
                      </div>

                      {/* Title & URL */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold truncate ${isEnabled ? 'text-white' : 'text-gray-400 line-through'}`}>
                            {link.title}
                          </span>
                          {link.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cluster-acid/20 text-cluster-acid border border-cluster-acid/30">
                              {link.badge}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#8E8E88] bg-white/5 border border-white/10">
                            {link.category || 'Link'}
                          </span>
                        </div>

                        {link.subtitle && (
                          <p className="text-xs text-gray-400 truncate font-sans">
                            {link.subtitle}
                          </p>
                        )}

                        <a
                          href={getSafeUrl(link.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-cluster-acid truncate transition-colors"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </div>
                    </div>

                    {/* Right: Toggle Switch & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                      {/* Live Enable / Disable Toggle Switch (Core Feature) */}
                      <button
                        onClick={(e) => handleToggle(link.id, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                          isEnabled
                            ? 'bg-cluster-acid/15 border border-cluster-acid/50 text-cluster-acid hover:bg-cluster-acid/25'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                        }`}
                        title={isEnabled ? 'Click to Disable from Linktree' : 'Click to Enable on Linktree'}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isEnabled ? 'bg-cluster-acid shadow-sm shadow-cluster-acid animate-pulse' : 'bg-gray-500'
                          }`}
                        />
                        <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === filteredLinks.length - 1}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-20 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(link)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(link.id, link.title)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Phone Preview Mockup (4 Columns) */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0F1012] border-2 border-white/[0.12] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cluster-acid" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Public Preview
                </span>
              </div>
              <span className="text-[10px] font-mono text-cluster-acid bg-cluster-acid/10 px-2 py-0.5 rounded-full border border-cluster-acid/20">
                {enabledCount} Active
              </span>
            </div>

            {/* Phone Screen Frame */}
            <div className="rounded-2xl bg-[#080808] border border-white/10 p-4 max-h-[560px] overflow-y-auto space-y-3 scrollbar-none shadow-inner">
              {/* Mini Header */}
              <div className="text-center space-y-1 py-2">
                <div className="w-10 h-10 rounded-xl bg-black border border-cluster-acid/50 p-1.5 mx-auto">
                  <img src="/cluster-mark.svg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs font-bold text-white font-display">CLUSTER Community</div>
                <div className="text-[9px] font-mono text-cluster-acid">Official Social Links</div>
              </div>

              {/* Render only ENABLED links */}
              <div className="space-y-2">
                {links
                  .filter((l) => l.enabled !== false)
                  .map((l) => (
                    <div
                      key={l.id}
                      className={`${l.bgClass || 'bg-black text-white'} rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm text-left`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                        <BrandIconPreview type={l.iconType} className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold leading-tight truncate">{l.title}</div>
                        {l.subtitle && (
                          <div className="text-[9px] opacity-80 truncate">{l.subtitle}</div>
                        )}
                      </div>
                      <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                    </div>
                  ))}
              </div>

              {enabledCount === 0 && (
                <div className="py-8 text-center text-xs font-mono text-gray-500 italic">
                  All links currently disabled.
                </div>
              )}

              {/* Mini Footer */}
              <div className="text-center pt-2 text-[9px] font-mono text-gray-600">
                © {new Date().getFullYear()} CLUSTER Society
              </div>
            </div>

            <p className="text-[11px] font-sans text-gray-400 text-center">
              Toggling links ON/OFF updates this live preview and the public Linktree page instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Social Link Modal */}
      {isModalOpen && editingLink && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0F1012] border border-white/[0.12] p-6 sm:p-8 shadow-2xl text-[#F8F7F3] space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-lg font-display font-bold text-white">
                  {editingLink.id ? 'Edit Social Link' : 'Add Social Channel'}
                </h3>
                <p className="text-xs text-gray-400 font-sans">
                  Configure titles, URLs, and styling for the Linktree card.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#D4D4CD]">Link Title *</label>
                <input
                  type="text"
                  required
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  placeholder="e.g. Join our Discord Community"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#D4D4CD]">Subtitle / Description</label>
                <input
                  type="text"
                  value={editingLink.subtitle}
                  onChange={(e) => setEditingLink({ ...editingLink, subtitle: e.target.value })}
                  placeholder="e.g. 300+ developers, AI researchers & builders"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#D4D4CD]">Destination URL *</label>
                <input
                  type="url"
                  required
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                />
              </div>

              {/* Icon & Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#D4D4CD]">Icon Type</label>
                  <select
                    value={editingLink.iconType}
                    onChange={(e) => setEditingLink({ ...editingLink, iconType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#141517] text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#D4D4CD]">Category</label>
                  <select
                    value={editingLink.category}
                    onChange={(e) => setEditingLink({ ...editingLink, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                  >
                    {['Featured', 'Community', 'Socials', 'Developer'].map((cat) => (
                      <option key={cat} value={cat} className="bg-[#141517] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Badge & Enable Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#D4D4CD]">Optional Badge</label>
                  <input
                    type="text"
                    value={editingLink.badge || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, badge: e.target.value })}
                    placeholder="e.g. Open Now, New, 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLink.enabled !== false}
                      onChange={(e) => setEditingLink({ ...editingLink, enabled: e.target.checked })}
                      className="w-4 h-4 accent-cluster-acid rounded cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white">
                      Visible on Linktree (Enabled)
                    </span>
                  </label>
                </div>
              </div>

              {/* Color Preset Palette */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono text-[#D4D4CD]">Color Theme Preset</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = editingLink.bgClass === preset.value
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setEditingLink({ ...editingLink, bgClass: preset.value })}
                        className={`h-9 rounded-xl border flex items-center justify-center transition-all ${preset.value} ${
                          isSelected ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={preset.label}
                      >
                        {isSelected && <Check className="w-4 h-4 text-current" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cluster-acid text-black font-bold text-xs font-mono shadow-md shadow-cluster-acid/20 hover:scale-105 transition-transform"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
