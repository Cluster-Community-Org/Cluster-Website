import React, { useState, useEffect, useMemo } from 'react'
import {
  Globe,
  Rocket,
  Calendar,
  Users,
  ExternalLink,
  Share2,
  Check,
  QrCode,
  X,
  Sparkles,
  Download,
  Copy,
  Search,
  Cpu,
  Eye,
  Zap,
} from 'lucide-react'
import { COMMUNITY_INFO, SOCIAL_LINKS as DEFAULT_SOCIAL_LINKS } from './data/links.js'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js'
import { ClusterMark, Corners, DotWave } from './components/Brand.jsx'

const STORAGE_KEY = 'cluster_cms_social_links'

// Map database row to component link format
function mapDBLink(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    url: row.url,
    iconType: row.icon_type || 'globe',
    bgClass: row.bg_class || '',
    badge: row.badge || '',
    category: row.category || 'General',
    enabled: row.enabled !== undefined ? Boolean(row.enabled) : true,
    isHighlighted: Boolean(row.is_highlighted),
    order: row.sort_order !== undefined ? Number(row.sort_order) : 0,
  }
}

// Brand SVG Icons with authentic vector paths
function BrandIcon({ type, className = 'w-5 h-5' }) {
  switch (type) {
    case 'discord':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'x':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      )
    case 'github':
      return (
        <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className={className} aria-hidden="true">
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
      return <ExternalLink className={className} />
  }
}

export default function App() {
  const [links, setLinks] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.order || 0) - (b.order || 0))
        }
      }
    } catch {}
    return DEFAULT_SOCIAL_LINKS
  })

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [isQrOpen, setIsQrOpen] = useState(false)

  // Real-time synchronization with Supabase dedicated table and local storage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue)
          if (Array.isArray(updated)) {
            setLinks(updated.sort((a, b) => (a.order || 0) - (b.order || 0)))
          }
        } catch {}
      }
    }

    const handleCustomUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setLinks(e.detail.sort((a, b) => (a.order || 0) - (b.order || 0)))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cluster_socials_updated', handleCustomUpdate)

    let channel = null
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY

    if (isSupabaseConfigured() && supabase) {
      // 1. Initial query from dedicated social_links table
      supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true })
        .then(({ data: remoteLinks, error }) => {
          if (!error && Array.isArray(remoteLinks) && remoteLinks.length > 0) {
            const mapped = remoteLinks.map(mapDBLink)
            setLinks(mapped)
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped))
            } catch {}
          } else {
            // Fallback: check stats inside homepage_config
            fetch(`${supabaseUrl}/rest/v1/homepage_config?id=eq.1&select=social_links,stats`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            })
              .then((res) => res.json())
              .then((data) => {
                if (Array.isArray(data) && data[0]) {
                  let fetched = null
                  if (Array.isArray(data[0].social_links) && data[0].social_links.length > 0) {
                    fetched = data[0].social_links
                  } else if (Array.isArray(data[0].stats)) {
                    const meta = data[0].stats.find((s) => s && s.__type === 'cluster_social_links')
                    if (meta && Array.isArray(meta.links)) fetched = meta.links
                  }
                  if (fetched && Array.isArray(fetched)) {
                    const sorted = fetched.sort((a, b) => (a.order || 0) - (b.order || 0))
                    setLinks(sorted)
                    try {
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
                    } catch {}
                  }
                }
              })
              .catch(() => {})
          }
        })

      // 2. Realtime listener on shared social_links table
      channel = supabase
        .channel('linktree-socials-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'social_links' }, async () => {
          const { data: updated } = await supabase
            .from('social_links')
            .select('*')
            .order('sort_order', { ascending: true })
          if (updated && Array.isArray(updated) && updated.length > 0) {
            const mapped = updated.map(mapDBLink)
            setLinks(mapped)
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped))
            } catch {}
          }
        })
        .subscribe()
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cluster_socials_updated', handleCustomUpdate)
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // Public Links: only enabled links
  const enabledLinks = useMemo(() => {
    return links.filter((link) => link.enabled !== false)
  }, [links])

  // Filter categories
  const categories = useMemo(() => {
    const set = new Set(['All'])
    enabledLinks.forEach((l) => {
      if (l.category) set.add(l.category)
    })
    return Array.from(set)
  }, [enabledLinks])

  // Filtered links by search & category
  const filteredLinks = useMemo(() => {
    return enabledLinks.filter((link) => {
      const matchesCategory =
        activeCategory === 'All' || link.category?.toLowerCase() === activeCategory.toLowerCase()
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        !query ||
        link.title?.toLowerCase().includes(query) ||
        link.subtitle?.toLowerCase().includes(query) ||
        link.badge?.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
  }, [enabledLinks, activeCategory, searchQuery])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator
        .share({
          title: 'CLUSTER Community Society — Official Hub',
          text: 'Hands on GPUs, the NVIDIA DGX H200, and Applied AI. Join the society.',
          url,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://clustersociety.tech'
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(currentUrl)}&color=000000&bgcolor=C6FF4D&margin=14`

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start px-4 py-8 sm:py-14 sm:px-6 bg-[#080808] text-[#F8F7F3] selection:bg-[#C6FF4D] selection:text-black">
      {/* Background Architectural Atmosphere: Grain + Subtle Grid + Dot Matrix Wave */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-cluster opacity-40"></div>
        <div className="absolute inset-0 grain-overlay"></div>
        {/* Hardware Horizon Glow */}
        <div className="absolute -top-[25vw] left-1/2 -translate-x-1/2 w-[70vw] h-[35vw] rounded-full bg-[#C6FF4D]/[0.035] blur-[120px]"></div>
        <DotWave className="bottom-0 h-44 sm:h-64" color="#C6FF4D" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col gap-6">
        
        {/* Header Quick Actions */}
        <div className="flex items-center justify-end gap-2 px-1">
          <button
            onClick={() => setIsQrOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-xs font-mono text-[#D4D4CD] hover:text-white transition-all flex items-center gap-1.5 focus-visible:outline-none"
            title="Show QR Code"
            aria-label="Show QR Code modal"
          >
            <QrCode className="w-4 h-4 text-[#C6FF4D]" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-xs font-mono text-[#D4D4CD] hover:text-white transition-all flex items-center gap-1.5 focus-visible:outline-none"
            title="Share or Copy Link"
            aria-label="Share Linktree"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#C6FF4D]" />
                <span className="text-[#C6FF4D] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Card / Society Anchor */}
        <header className="relative p-6 sm:p-8 rounded-3xl bg-[#0D0E10]/90 backdrop-blur-xl border border-white/[0.09] shadow-surface-card text-center flex flex-col items-center">
          <Corners className="border-[#C6FF4D]/30" size="w-3.5 h-3.5" inset="top-3 left-3 right-3 bottom-3" />

          {/* Traced Official Logo Emblem with Animated Sparks */}
          <div className="relative mb-5 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-white/10 group-hover:border-[#C6FF4D]/60 p-4 shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <ClusterMark className="w-full h-full" animated={true} />
            </div>
            <div
              className="absolute -bottom-1 -right-1 p-1 bg-[#C6FF4D] text-black rounded-full shadow-md"
              title="Verified Society Hub"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Typography Hierarchy */}
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-snug mb-1">
            {COMMUNITY_INFO.name}
          </h1>

          {/* Supercomputing Affiliation Banner */}
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#C6FF4D] bg-[#C6FF4D]/10 px-3 py-1 rounded-full border border-[#C6FF4D]/25 mt-2 mb-3">
            <span>{COMMUNITY_INFO.institution}</span>
            <span className="text-[#8E8E88]">•</span>
            <span>NVIDIA DGX H200</span>
          </div>

          <p className="text-sm font-medium text-neutral-200 max-w-md mb-2">
            {COMMUNITY_INFO.tagline}
          </p>

          <p className="text-xs text-[#8E8E88] max-w-md leading-relaxed font-sans">
            {COMMUNITY_INFO.description}
          </p>
        </header>

        {/* Filter Pills & Search */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E88]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels, recruitment, Discord..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0D0E10]/80 border border-white/[0.08] focus:border-[#C6FF4D]/60 focus:bg-[#141517] text-xs font-sans text-white placeholder-[#8E8E88] transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8E8E88] hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#C6FF4D] text-black font-bold shadow-sm shadow-[#C6FF4D]/20'
                        : 'bg-white/[0.04] text-[#8E8E88] hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Links Stack */}
        <div className="flex flex-col gap-3">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#0D0E10]/60 border border-white/[0.08]">
              <p className="text-sm font-mono text-neutral-400">No links found matching your search.</p>
              <button
                onClick={() => {
                  setActiveCategory('All')
                  setSearchQuery('')
                }}
                className="mt-3 text-xs font-mono text-[#C6FF4D] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredLinks.map((link) => {
              // Highlighting treatment
              const isAccent = link.isHighlighted || link.id === 'website' || link.id === 'join'

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block w-full outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF4D] rounded-2xl"
                >
                  <div
                    className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                      isAccent
                        ? 'bg-[#121417] border-[#C6FF4D]/40 hover:border-[#C6FF4D] hover:shadow-cluster-glow hover:translate-y-[-2px]'
                        : 'bg-[#0D0E10] border-white/[0.08] hover:border-white/20 hover:bg-[#141517] hover:translate-y-[-2px]'
                    }`}
                  >
                    {/* Icon Box */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                        isAccent
                          ? 'bg-[#C6FF4D] text-black shadow-md shadow-[#C6FF4D]/20'
                          : 'bg-white/[0.06] text-white border border-white/10'
                      }`}
                    >
                      <BrandIcon type={link.iconType} className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-white tracking-tight truncate group-hover:text-[#C6FF4D] transition-colors">
                          {link.title}
                        </span>
                        {link.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                              isAccent
                                ? 'bg-[#C6FF4D]/20 text-[#C6FF4D] border border-[#C6FF4D]/40'
                                : 'bg-white/10 text-neutral-300 border border-white/10'
                            }`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </div>
                      {link.subtitle && (
                        <p className="text-xs text-[#8E8E88] truncate font-sans mt-0.5 group-hover:text-neutral-300 transition-colors">
                          {link.subtitle}
                        </p>
                      )}
                    </div>

                    {/* External Link Arrow Indicator with Micro-Interaction */}
                    <div className="shrink-0 text-[#8E8E88] group-hover:text-[#C6FF4D] transition-all duration-300 group-hover:translate-x-1">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              )
            })
          )}
        </div>

        {/* The Three Circles Blueprint (Tactile Bento Grid) */}
        <section className="p-6 rounded-3xl bg-[#0D0E10]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C6FF4D] font-bold">
                COMMUNITY STRUCTURE
              </div>
              <h2 className="text-sm font-display font-bold text-white">The Three Circles</h2>
            </div>
            <a
              href="https://clustersociety.tech/join"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-[#C6FF4D] hover:underline flex items-center gap-1"
            >
              <span>Join a circle</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
            {/* Compute Circle */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#C6FF4D]/30 transition-colors space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C6FF4D] font-mono">
                <Zap className="w-3.5 h-3.5" />
                <span>Compute</span>
              </div>
              <p className="text-[11px] text-[#8E8E88] leading-relaxed">
                DGX H200, CUDA kernels, supercomputing, LLM pre-training.
              </p>
            </div>

            {/* Applied AI Circle */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-400/30 transition-colors space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>Applied AI</span>
              </div>
              <p className="text-[11px] text-[#8E8E88] leading-relaxed">
                Autonomous robotics, computer vision, Omniverse digital twins.
              </p>
            </div>

            {/* Crew Circle */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-400/30 transition-colors space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 font-mono">
                <Users className="w-3.5 h-3.5" />
                <span>Crew</span>
              </div>
              <p className="text-[11px] text-[#8E8E88] leading-relaxed">
                Brand design, media, hackathons, outreach &amp; technical logistics.
              </p>
            </div>
          </div>
        </section>

        {/* Editorial Footer */}
        <footer className="text-center py-6 border-t border-white/[0.08] space-y-2">
          <p className="text-xs font-mono text-[#8E8E88]">
            © {new Date().getFullYear()} CLUSTER Community Society • Galgotias University
          </p>
          <p className="text-[11px] font-mono text-[#5A5C61]">
            Anchored by the NVIDIA DGX H200 · Built by Engineers &amp; Developers
          </p>
        </footer>
      </div>

      {/* QR Code Modal (High-Contrast, Instant Download) */}
      {isQrOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsQrOpen(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0D0E10] border border-[#C6FF4D]/40 p-6 sm:p-8 shadow-2xl text-center text-[#F8F7F3] space-y-5">
            <Corners className="border-[#C6FF4D]/40" size="w-3 h-3" inset="top-3 left-3 right-3 bottom-3" />

            <button
              onClick={() => setIsQrOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold tracking-widest text-[#C6FF4D] uppercase">
                SCAN WITH PHONE CAMERA
              </div>
              <h3 className="text-xl font-display font-extrabold text-white">
                CLUSTER Links QR
              </h3>
              <p className="text-xs text-[#8E8E88]">
                Instant access to society channels &amp; recruitment
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#C6FF4D] border-4 border-black flex items-center justify-center shadow-xl mx-auto w-fit">
              <img
                src={qrCodeUrl}
                alt="Scan CLUSTER QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
              />
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-[#C6FF4D]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>

              <a
                href={qrCodeUrl}
                download="cluster-socials-qr.png"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C6FF4D] text-black font-bold text-xs font-mono transition-transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Save QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
