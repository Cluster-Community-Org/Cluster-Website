import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  ArrowLeft,
} from 'lucide-react'
import { clusterDataService } from '../services/clusterDataService.js'

export const COMMUNITY_INFO = {
  name: 'CLUSTER Community Society',
  institution: 'Galgotias University',
  tagline: 'Student Research, Distributed Supercomputing & Applied AI',
  description:
    'Anchored by the NVIDIA DGX H200. Accelerating foundational LLMs, autonomous robotics, computer vision, and high-performance computing.',
  logo: '/cluster-mark.svg',
}

function BrandIcon({ type, className = 'w-6 h-6' }) {
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
      return <ExternalLink className={className} />
  }
}

export default function SocialsPage() {
  const [links, setLinks] = useState(() => clusterDataService.getSocialLinks())
  const [copied, setCopied] = useState(false)
  const [isQrOpen, setIsQrOpen] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setLinks(clusterDataService.getSocialLinks())
    }
    window.addEventListener('cluster_socials_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('cluster_socials_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const visibleLinks = links.filter((link) => link.enabled !== false)

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: 'CLUSTER Community Society — Links Hub',
        text: 'Connect with CLUSTER: DGX H200 Supercomputing, Applied AI, and Developer Circles.',
        url,
      }).catch(() => {})
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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}&color=000000&bgcolor=C6FF4D&margin=12`

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-10 scroll-smooth bg-[#080808]">
      {/* Background Decorators */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:24px_24px]"></div>

        <div className="absolute top-0 right-0 w-36 h-36 md:w-52 md:h-52 bg-[#C6FF4D] rounded-bl-[100px] opacity-80 blur-xl"></div>
        <div className="absolute top-0 right-0 w-28 h-28 md:w-40 md:h-40 bg-[#76B900] rounded-bl-[80px]"></div>

        <div className="absolute bottom-0 left-0 w-36 h-36 md:w-52 md:h-52 bg-[#38BDF8] rounded-tr-[100px] opacity-75 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-28 h-28 md:w-40 md:h-40 bg-[#0EA5E9] rounded-tr-[80px]"></div>

        <div className="absolute bottom-0 right-0 w-44 h-44 md:w-64 md:h-64 bg-[#8B5CF6] rounded-tl-[120px] opacity-70 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-[#6366F1] rounded-tl-[100px]"></div>
      </div>

      {/* Main Container Card */}
      <div className="relative w-full max-w-md md:max-w-3xl z-10 my-4 sm:my-8 transition-all duration-500">
        <div className="bg-[#0F1012]/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/[0.12] p-6 sm:p-8 md:p-12 text-[#F8F7F3]">
          
          {/* Header Action Tools */}
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-white/[0.08]">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono font-medium text-[#C6FF4D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>clustersociety.tech</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQrOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#D4D4CD] hover:text-white transition-all flex items-center gap-1.5"
                title="Show QR Code"
              >
                <QrCode className="w-4 h-4 text-[#C6FF4D]" />
                <span className="hidden sm:inline">QR Code</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#D4D4CD] hover:text-white transition-all flex items-center gap-1.5"
                title="Share or Copy Link"
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
          </div>

          {/* Profile & Branding Header */}
          <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
            <div className="relative mb-4 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-[#C6FF4D]/60 p-3 shadow-lg shadow-[#C6FF4D]/10 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                <img
                  src={COMMUNITY_INFO.logo}
                  alt="CLUSTER Society Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#C6FF4D] text-black rounded-full shadow-md" title="Verified Hub">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-tight mb-2">
              {COMMUNITY_INFO.name}
            </h1>
            
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#C6FF4D] bg-[#C6FF4D]/10 px-3 py-1 rounded-full border border-[#C6FF4D]/25 mb-3">
              <span>{COMMUNITY_INFO.institution}</span>
              <span>•</span>
              <span>NVIDIA DGX H200</span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-gray-200 max-w-lg mb-2">
              {COMMUNITY_INFO.tagline}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
              {COMMUNITY_INFO.description}
            </p>
          </div>

          {/* Links Grid */}
          {visibleLinks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] mb-8">
              <p className="text-sm font-mono text-gray-400">No active links currently published.</p>
              <p className="text-xs text-gray-600 mt-1">Enable links in the Admin Panel to display them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-8">
              {visibleLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full group focus:outline-none"
                >
                  <div
                    className={`${link.bgClass || 'bg-white/10 text-white'} rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 hover:shadow-xl hover:scale-[1.025] active:scale-[0.98] active:shadow-md shadow-md min-h-[72px] sm:min-h-[76px] relative overflow-hidden`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/20 flex items-center justify-center transition-transform group-hover:scale-110">
                      <BrandIcon type={link.iconType || 'link'} className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold leading-snug truncate">
                          {link.title}
                        </span>
                        {link.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black text-[#C6FF4D] uppercase shrink-0">
                            {link.badge}
                          </span>
                        )}
                      </div>
                      {link.subtitle && (
                        <p className="text-[11px] sm:text-xs opacity-90 truncate font-sans mt-0.5">
                          {link.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Circles Badges Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#C6FF4D] font-bold">
                CLUSTER SOCIETY CIRCLES
              </div>
              <div className="text-xs text-gray-400">
                Pick your focus in recruitment or collaborate across tracks
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#C6FF4D]/15 text-[#C6FF4D] border border-[#C6FF4D]/30 font-bold">
                ⚡ Compute
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-sky-400/15 text-sky-400 border border-sky-400/30 font-bold">
                👁️ Applied AI
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-purple-400/15 text-purple-400 border border-purple-400/30 font-bold">
                🚀 Crew
              </span>
            </div>
          </div>

          {/* Footer Area */}
          <div className="text-center pt-6 border-t-2 border-white/[0.08] space-y-2">
            <p className="text-xs font-mono text-gray-400">
              © {new Date().getFullYear()} CLUSTER Community Society • Galgotias University
            </p>
            <p className="text-[11px] font-mono text-gray-500">
              Maintained with ⚡ by the Builders &amp; Developers of CLUSTER
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQrOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsQrOpen(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0F1012] border-2 border-[#C6FF4D]/40 p-6 sm:p-8 shadow-2xl text-center text-[#F8F7F3] space-y-5">
            <button
              onClick={() => setIsQrOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold tracking-widest text-[#C6FF4D] uppercase">
                SCAN WITH PHONE CAMERA
              </div>
              <h3 className="text-xl font-display font-black text-white">
                CLUSTER Links QR
              </h3>
              <p className="text-xs text-gray-400">
                Instant access to all society channels &amp; recruitment
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
