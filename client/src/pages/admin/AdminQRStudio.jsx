import { useState, useEffect, useRef, useMemo } from 'react'
import {
  QrCode,
  Download,
  Copy,
  Check,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Sliders,
  Palette,
  ExternalLink,
  RefreshCw,
  Upload,
  Calendar,
  Layers,
  Eye,
  BarChart3,
  BookmarkPlus,
  Trash2,
  TrendingUp,
  Clock,
  Radio,
  FileText,
  RotateCcw,
  Globe,
} from 'lucide-react'
import { generateQRMatrix } from '../../utils/qrEngine.js'
import { clusterDataService } from '../../services/clusterDataService.js'

// Official Cluster Emblem Vector Paths
const CLUSTER_MARK_PATH =
  'M76,437 L72,446 L69,458 L69,474 L73,488 L80,500 L229,666 L240,677 L251,683 L259,685 L464,685 L474,682 L483,677 L533,622 L533,618 L530,615 L298,615 L291,613 L284,609 L160,472 L157,466 L156,456 L161,446 L230,380 L245,373 L374,373 L381,375 L388,379 L420,413 L443,435 L454,439 L486,439 L496,435 L502,430 L514,416 L516,407 L513,395 L440,315 L430,309 L418,306 L214,306 L199,310 L190,315 L183,321 L82,428 Z M314,194 L262,249 L260,253 L262,258 L264,259 L455,259 L465,264 L479,278 L498,300 L589,398 L593,406 L593,415 L590,422 L528,482 L519,487 L512,489 L403,489 L399,488 L389,483 L343,435 L329,429 L280,429 L271,432 L254,448 L252,452 L251,467 L256,477 L325,550 L329,553 L343,559 L349,560 L551,560 L564,557 L577,550 L663,455 L674,441 L681,425 L682,403 L678,390 L671,378 L503,197 L497,193 L483,188 L328,188 L321,190 Z'

const CLUSTER_SPARKS_PATHS = [
  'M24,183 L19,194 L18,201 L19,208 L24,219 L32,227 L115,271 L121,273 L132,274 L142,271 L149,266 L153,261 L157,252 L158,242 L154,230 L147,222 L127,211 L67,174 L54,169 L42,170 L32,175 Z',
  'M140,71 L130,80 L125,90 L124,100 L128,112 L178,181 L179,184 L185,190 L196,195 L206,195 L214,192 L226,180 L229,169 L227,158 L222,149 L191,102 L178,80 L171,73 L160,68 L148,68 Z',
  'M277,18 L266,23 L259,30 L255,38 L254,51 L272,140 L274,144 L281,151 L289,155 L300,156 L305,155 L314,150 L322,140 L324,134 L324,123 L313,46 L309,32 L301,23 L290,18 Z',
]

// Built-in color themes optimized for 100% optical camera readability & aesthetics
const COLOR_THEMES = [
  {
    id: 'cyber-silver',
    name: 'Cyber Silver (100% Scannable)',
    bg: '#ECEFF4',
    lightDot: '#C8CCD8',
    darkDot: '#101014',
    eyeOuter: '#ECEFF4',
    eyeInner: '#101014',
    sparkColor: '#A3E635',
  },
  {
    id: 'pure-white',
    name: 'Clean White (High Reliability Print)',
    bg: '#FFFFFF',
    lightDot: '#E4E4E7',
    darkDot: '#09090B',
    eyeOuter: '#FFFFFF',
    eyeInner: '#09090B',
    sparkColor: '#84CC16',
  },
  {
    id: 'paper-cream',
    name: 'Signature Paper (Editorial Ivory)',
    bg: '#F5EFE6',
    lightDot: '#DFD8CC',
    darkDot: '#18181B',
    eyeOuter: '#F5EFE6',
    eyeInner: '#18181B',
    sparkColor: '#B8F532',
  },
  {
    id: 'acid-noir',
    name: 'Acid Noir (High-Tech Dark)',
    bg: '#0C0D0E',
    lightDot: 'rgba(255, 255, 255, 0.12)',
    darkDot: '#C6FF4D',
    eyeOuter: '#0C0D0E',
    eyeInner: '#C6FF4D',
    sparkColor: '#C6FF4D',
  },
]

const DEFAULT_PRODUCTION_URL = import.meta.env.VITE_PRODUCTION_URL || 'https://cluster-club.vercel.app'

export default function AdminQRStudio() {
  // Load saved configuration from persistent storage
  const savedConfig = useMemo(() => clusterDataService.getQRConfig() || {}, [])

  // Input & Campaign State
  const [url, setUrl] = useState(savedConfig.url || 'https://cluster-club.vercel.app/')
  const [title, setTitle] = useState(savedConfig.title || 'Cluster Official QR')
  const [activePreset, setActivePreset] = useState(savedConfig.activePreset || 'home')

  // Production Tracking Domain
  const [productionDomain, setProductionDomain] = useState(
    savedConfig.productionDomain || DEFAULT_PRODUCTION_URL
  )
  const [showDomainEditor, setShowDomainEditor] = useState(false)

  // Scan Tracking State
  const [enableTracking, setEnableTracking] = useState(savedConfig.enableTracking ?? true)
  const [customSlug, setCustomSlug] = useState(savedConfig.customSlug || '')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [qrHistory, setQrHistory] = useState(() => clusterDataService.getQRHistory())

  // Theme & Color State
  const [selectedThemeId, setSelectedThemeId] = useState(savedConfig.selectedThemeId || 'cyber-silver')
  const [customBg, setCustomBg] = useState(savedConfig.customBg || '#ECEFF4')
  const [customLightDot, setCustomLightDot] = useState(savedConfig.customLightDot || '#C8CCD8')
  const [customDarkDot, setCustomDarkDot] = useState(savedConfig.customDarkDot || '#101014')
  const [customEyeOuter, setCustomEyeOuter] = useState(savedConfig.customEyeOuter || '#ECEFF4')
  const [customEyeInner, setCustomEyeInner] = useState(savedConfig.customEyeInner || '#101014')
  const [customSparkColor, setCustomSparkColor] = useState(savedConfig.customSparkColor || '#A3E635')

  // Artwork & Visual Tuning
  const [artworkMode, setArtworkMode] = useState(savedConfig.artworkMode || 'cluster-emblem')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [artworkScale, setArtworkScale] = useState(savedConfig.artworkScale ?? 72)
  const [artworkOpacity, setArtworkOpacity] = useState(savedConfig.artworkOpacity ?? 22)

  // Dot Matrix & Eye Geometry
  const [dotScale, setDotScale] = useState(savedConfig.dotScale ?? 44)
  const [microDotScale, setMicroDotScale] = useState(savedConfig.microDotScale ?? 12)
  const [glowIntensity, setGlowIntensity] = useState(savedConfig.glowIntensity ?? 0)
  const [eyeStyle, setEyeStyle] = useState(savedConfig.eyeStyle || 'diamond')
  const [errorCorrection, setErrorCorrection] = useState(savedConfig.errorCorrection || 'H')

  // UI state
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState('')
  const [renderStats, setRenderStats] = useState({ size: 33, cells: 1089 })
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Fetch upcoming events for quick presets
  const events = useMemo(() => clusterDataService.getEvents(), [])
  const nextEvent = events.find((e) => (e.status || '').toLowerCase() === 'upcoming') || events[0]

  // Auto-save user settings to localStorage in real-time
  useEffect(() => {
    clusterDataService.saveQRConfig({
      url,
      title,
      activePreset,
      productionDomain,
      enableTracking,
      customSlug,
      selectedThemeId,
      customBg,
      customLightDot,
      customDarkDot,
      customEyeOuter,
      customEyeInner,
      customSparkColor,
      artworkMode,
      artworkScale,
      artworkOpacity,
      dotScale,
      microDotScale,
      glowIntensity,
      eyeStyle,
      errorCorrection,
    })
  }, [
    url,
    title,
    activePreset,
    productionDomain,
    enableTracking,
    customSlug,
    selectedThemeId,
    customBg,
    customLightDot,
    customDarkDot,
    customEyeOuter,
    customEyeInner,
    customSparkColor,
    artworkMode,
    artworkScale,
    artworkOpacity,
    dotScale,
    microDotScale,
    glowIntensity,
    eyeStyle,
    errorCorrection,
  ])

  // Listen for realtime scan updates and library changes
  useEffect(() => {
    const handleHistoryUpdate = (e) => {
      setQrHistory(e.detail || clusterDataService.getQRHistory())
    }
    window.addEventListener('cluster_qr_history_updated', handleHistoryUpdate)
    return () => window.removeEventListener('cluster_qr_history_updated', handleHistoryUpdate)
  }, [])

  // Quick preset links
  const linkPresets = [
    {
      id: 'home',
      label: 'Cluster Home',
      url: 'https://cluster-club.vercel.app/',
    },
    {
      id: 'event',
      label: nextEvent ? `Event: ${nextEvent.title?.slice(0, 18)}...` : 'Next Event',
      url: nextEvent?.lumaUrl || 'https://luma.com/2o05q51x',
    },
    {
      id: 'join',
      label: 'Apply to Join',
      url: 'https://cluster-club.vercel.app/join',
    },
    {
      id: 'socials',
      label: 'Linktree / Socials',
      url: 'https://cluster-socials.vercel.app/',
    },
    {
      id: 'github',
      label: 'GitHub Org',
      url: 'https://github.com/Cluster-Community-Org',
    },
  ]

  // Clean slug computation
  const activeSlug = useMemo(() => {
    if (customSlug.trim()) {
      return customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    }
    const cleanTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 24)
    return cleanTitle || 'cluster-qr'
  }, [customSlug, title])

  // Tracked redirect URL vs raw URL
  const destinationUrl = url.trim() || 'https://cluster-club.vercel.app/'
  // Production URL for redirect - ALWAYS uses the production domain (e.g. https://cluster-club.vercel.app)
  // so QR codes scanned on mobile cameras anywhere in the world resolve properly
  const trackingOrigin = (productionDomain.trim() || DEFAULT_PRODUCTION_URL).replace(/\/+$/, '')
  const trackingUrl = `${trackingOrigin}/r/${activeSlug}`
  const finalEncodedUrl = enableTracking ? trackingUrl : destinationUrl

  // Helper to ensure any library item uses the production redirect URL (never localhost)
  const getCleanTrackingUrl = (item) => {
    if (item.trackingUrl && !item.trackingUrl.includes('localhost') && !item.trackingUrl.includes('127.0.0.1')) {
      return item.trackingUrl
    }
    return `${trackingOrigin}/r/${item.slug}`
  }

  const applyTheme = (theme) => {
    setSelectedThemeId(theme.id)
    setCustomBg(theme.bg)
    setCustomLightDot(theme.lightDot)
    setCustomDarkDot(theme.darkDot)
    setCustomEyeOuter(theme.eyeOuter)
    setCustomEyeInner(theme.eyeInner)
    setCustomSparkColor(theme.sparkColor)
  }

  // Handle custom image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setUploadedImage(img)
        setArtworkMode('uploaded')
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  // Save QR to library & enable tracking
  const handleSaveToLibrary = () => {
    const item = {
      id: `qr_${Date.now()}`,
      slug: activeSlug,
      title: title.trim() || 'Untitled QR',
      destinationUrl,
      trackingUrl,
      trackScans: enableTracking,
      scans: 0,
      createdAt: new Date().toISOString(),
      lastScannedAt: null,
      config: {
        selectedThemeId,
        customBg,
        customLightDot,
        customDarkDot,
        customEyeOuter,
        customEyeInner,
        customSparkColor,
        artworkMode,
        artworkScale,
        artworkOpacity,
        dotScale,
        microDotScale,
        glowIntensity,
        eyeStyle,
        errorCorrection,
        productionDomain,
      },
    }

    clusterDataService.saveQRCode(item)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  // Load a previously saved QR from library into studio editor
  const handleLoadQR = (item) => {
    setTitle(item.title)
    setUrl(item.destinationUrl)
    setCustomSlug(item.slug)
    setEnableTracking(Boolean(item.trackScans))
    if (item.config) {
      if (item.config.productionDomain) setProductionDomain(item.config.productionDomain)
      if (item.config.selectedThemeId) setSelectedThemeId(item.config.selectedThemeId)
      if (item.config.customBg) setCustomBg(item.config.customBg)
      if (item.config.customLightDot) setCustomLightDot(item.config.customLightDot)
      if (item.config.customDarkDot) setCustomDarkDot(item.config.customDarkDot)
      if (item.config.customEyeOuter) setCustomEyeOuter(item.config.customEyeOuter)
      if (item.config.customEyeInner) setCustomEyeInner(item.config.customEyeInner)
      if (item.config.customSparkColor) setCustomSparkColor(item.config.customSparkColor)
      if (item.config.artworkMode) setArtworkMode(item.config.artworkMode)
      if (item.config.artworkScale !== undefined) setArtworkScale(item.config.artworkScale)
      if (item.config.artworkOpacity !== undefined) setArtworkOpacity(item.config.artworkOpacity)
      if (item.config.dotScale !== undefined) setDotScale(item.config.dotScale)
      if (item.config.microDotScale !== undefined) setMicroDotScale(item.config.microDotScale)
      if (item.config.glowIntensity !== undefined) setGlowIntensity(item.config.glowIntensity)
      if (item.config.eyeStyle) setEyeStyle(item.config.eyeStyle)
      if (item.config.errorCorrection) setErrorCorrection(item.config.errorCorrection)
    }
  }

  const handleDeleteQR = (id) => {
    if (confirm('Delete this QR code from your library? Its tracking link will stop working.')) {
      clusterDataService.deleteQRCode(id)
    }
  }

  // Core Render Engine: Canvas Halftone Visual QR Renderer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const RENDER_SIZE = 1024
    canvas.width = RENDER_SIZE
    canvas.height = RENDER_SIZE

    try {
      // 1. Generate QR Code Module Matrix
      const qrData = generateQRMatrix(finalEncodedUrl, errorCorrection)
      const count = qrData.size
      setRenderStats({ size: count, cells: count * count })

      // Essential Quiet Zone: 4.0 modules of padding around code (ISO/IEC standard)
      const quietModules = 4.0
      const totalModules = count + quietModules * 2
      const cellSize = RENDER_SIZE / totalModules
      const margin = quietModules * cellSize
      const dotRadius = cellSize * (dotScale / 100)
      const microRadius = cellSize * (microDotScale / 100)

      // 2. Draw Background Base
      ctx.fillStyle = customBg
      ctx.fillRect(0, 0, RENDER_SIZE, RENDER_SIZE)

      // 3. Draw Artwork Layer (Cluster Mark or Custom Uploaded Image)
      if (artworkMode === 'cluster-emblem') {
        ctx.save()
        ctx.globalAlpha = artworkOpacity / 100

        const targetSize = (count * cellSize) * (artworkScale / 100)
        const scaleFactor = targetSize / 704
        const centerX = RENDER_SIZE / 2
        const centerY = RENDER_SIZE / 2

        ctx.translate(centerX, centerY)
        ctx.scale(scaleFactor, scaleFactor)
        ctx.translate(-350.5, -352)

        // Draw Cluster Mark
        const markPath = new Path2D(CLUSTER_MARK_PATH)
        ctx.fillStyle = '#141413'
        ctx.fill(markPath)

        // Draw 3 Neon Sparks
        ctx.fillStyle = customSparkColor
        CLUSTER_SPARKS_PATHS.forEach((pathStr) => {
          const sparkPath = new Path2D(pathStr)
          ctx.fill(sparkPath)
        })

        ctx.restore()
      } else if (artworkMode === 'uploaded' && uploadedImage) {
        ctx.save()
        ctx.globalAlpha = artworkOpacity / 100

        const targetSize = (count * cellSize) * (artworkScale / 100)
        const offsetX = (RENDER_SIZE - targetSize) / 2
        const offsetY = (RENDER_SIZE - targetSize) / 2

        ctx.drawImage(uploadedImage, offsetX, offsetY, targetSize, targetSize)
        ctx.restore()
      }

      // 4. Draw Halftone Dot Matrix with Solid Alignment & Timing Patterns
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          // Skip 8x8 corner regions where finder eyes reside
          if (qrData.isFinder(r, c)) continue

          const isDark = qrData.isDark(r, c)
          const x0 = margin + c * cellSize
          const y0 = margin + r * cellSize

          if (qrData.isFunctional && qrData.isFunctional(r, c)) {
            // Functional pattern (timing lines & 5x5 alignment patterns):
            // Keep solid for 100% optical camera detection and perspective grid lock-on
            if (isDark) {
              ctx.fillStyle = customDarkDot
              ctx.fillRect(x0, y0, cellSize, cellSize)
            }
          } else {
            // Data and error correction modules: elegant circular halftone dots
            const centerX = x0 + cellSize / 2
            const centerY = y0 + cellSize / 2

            ctx.beginPath()
            if (isDark) {
              ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2)
              ctx.fillStyle = customDarkDot
              ctx.fill()
            } else if (microRadius > 0) {
              ctx.arc(centerX, centerY, microRadius, 0, Math.PI * 2)
              ctx.fillStyle = customLightDot
              ctx.fill()
            }
          }
        }
      }

      // 5. Draw Precision Corner Finder Patterns (Eyes with Clean Separator)
      const drawFinderEye = (moduleCol, moduleRow) => {
        const startX = margin + moduleCol * cellSize
        const startY = margin + moduleRow * cellSize
        const eyeSize = 7 * cellSize
        const center = eyeSize / 2

        ctx.save()
        ctx.translate(startX, startY)

        // 1. Outer 7x7 Dark Frame (Squircle with rad = cellSize * 0.8)
        const rad = eyeStyle === 'classic' ? 0 : cellSize * 0.8
        ctx.beginPath()
        ctx.roundRect(0, 0, eyeSize, eyeSize, rad)
        ctx.fillStyle = customEyeInner
        ctx.fill()

        // 2. Inner 5x5 Light Ring (Matches background)
        const r1 = cellSize * 1.0
        ctx.beginPath()
        ctx.roundRect(r1, r1, eyeSize - r1 * 2, eyeSize - r1 * 2, rad * 0.7)
        ctx.fillStyle = customBg
        ctx.fill()

        // 3. Center 3x3 Pupil Core
        const px0 = cellSize * 2.0
        const py0 = cellSize * 2.0
        const coreSize = cellSize * 3.0
        const px1 = px0 + coreSize
        const py1 = py0 + coreSize
        const pcx = (px0 + px1) / 2
        const pcy = (py0 + py1) / 2

        if (eyeStyle === 'diamond') {
          // Rotated Diamond Pupil (Matches user reference aesthetic, 100% scannable)
          ctx.beginPath()
          ctx.moveTo(pcx, py0)
          ctx.lineTo(px1, pcy)
          ctx.lineTo(pcx, py1)
          ctx.lineTo(px0, pcy)
          ctx.closePath()
          ctx.fillStyle = customEyeInner
          ctx.fill()
        } else if (eyeStyle === 'circle') {
          ctx.beginPath()
          ctx.arc(center, center, coreSize / 2, 0, Math.PI * 2)
          ctx.fillStyle = customEyeInner
          ctx.fill()
        } else if (eyeStyle === 'squircle') {
          ctx.beginPath()
          ctx.roundRect(px0, py0, coreSize, coreSize, rad * 0.5)
          ctx.fillStyle = customEyeInner
          ctx.fill()
        } else {
          // Classic square pupil
          ctx.fillStyle = customEyeInner
          ctx.fillRect(px0, py0, coreSize, coreSize)
        }

        ctx.restore()
      }

      // Draw the 3 standard corner finder patterns at exact module coordinates
      drawFinderEye(0, 0) // Top-Left
      drawFinderEye(count - 7, 0) // Top-Right
      drawFinderEye(0, count - 7) // Bottom-Left
    } catch (err) {
      console.error('QR Render error:', err)
    }
  }, [
    finalEncodedUrl,
    errorCorrection,
    dotScale,
    microDotScale,
    glowIntensity,
    artworkMode,
    artworkScale,
    artworkOpacity,
    uploadedImage,
    eyeStyle,
    customBg,
    customLightDot,
    customDarkDot,
    customEyeOuter,
    customEyeInner,
    customSparkColor,
  ])

  // Download high-resolution PNG
  const downloadPNG = (resolution = 1024) => {
    const canvas = canvasRef.current
    if (!canvas) return

    let finalDataUrl = canvas.toDataURL('image/png')
    if (resolution === 2048) {
      const bigCanvas = document.createElement('canvas')
      bigCanvas.width = 2048
      bigCanvas.height = 2048
      const bigCtx = bigCanvas.getContext('2d')
      bigCtx.imageSmoothingEnabled = false
      bigCtx.drawImage(canvas, 0, 0, 2048, 2048)
      finalDataUrl = bigCanvas.toDataURL('image/png')
    }

    const a = document.createElement('a')
    a.download = `cluster-artistic-qr-${activeSlug}.png`
    a.href = finalDataUrl
    a.click()
  }

  // Copy image directly to system clipboard
  const copyImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } catch (err) {
      console.error('Copy to clipboard failed:', err)
    }
  }

  // Copy text link
  const copyTrackingLink = (link) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(''), 2000)
  }

  // Total aggregate scans
  const totalScans = useMemo(() => {
    return qrHistory.reduce((acc, curr) => acc + (curr.scans || 0), 0)
  }, [qrHistory])

  return (
    <div className="flex-1 overflow-y-auto bg-[#080808] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C6FF4D]" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8F7F3]">
                Artistic QR Studio & Scan Tracker
              </h1>
            </div>
            <p className="text-sm text-[#A0A0A0] mt-1.5">
              Custom halftone visual QR generator with automatic scan tracking, live link analytics, and saved presets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadPNG(1024)}
              className="btn-cluster-primary text-xs sm:text-sm px-4 py-2.5"
            >
              <Download className="w-4 h-4" />
              Download PNG (1024px)
            </button>
            <button
              onClick={() => downloadPNG(2048)}
              className="btn-cluster-secondary text-xs sm:text-sm px-4 py-2.5"
              title="Ultra-HD 2048px for physical print posters & stickers"
            >
              Ultra-HD (2048px)
            </button>
          </div>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Target URL, Title & Scan Tracking */}
            <div className="p-5 rounded-2xl bg-[#0C0D0E] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C6FF4D]" />
                  Campaign / QR Title
                </label>
                <span className="text-xs text-[#888] tabular-nums font-mono">
                  {renderStats.size}×{renderStats.size} grid
                </span>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hackathon Poster, Instagram Bio, Welcome Flyer..."
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#C6FF4D] text-sm"
              />

              <div className="pt-2">
                <label className="text-sm font-semibold text-white flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[#C6FF4D]" />
                    Destination Link (Where Scanners Go)
                  </span>
                  <span className="text-xs text-[#888] font-mono">{destinationUrl.length} chars</span>
                </label>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setActivePreset('custom')
                  }}
                  placeholder="https://your-custom-link.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#C6FF4D] text-sm font-mono tracking-tight"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-xs text-[#777] font-medium uppercase tracking-wider block mb-2">
                  Quick Club Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {linkPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setUrl(preset.url)
                        setActivePreset(preset.id)
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${activePreset === preset.id && url === preset.url
                          ? 'bg-[#C6FF4D] text-black font-semibold border-[#C6FF4D]'
                          : 'bg-white/5 text-[#CCC] border-white/10 hover:border-white/25 hover:text-white'
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan Tracking Dispatch Options */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTracking}
                      onChange={(e) => setEnableTracking(e.target.checked)}
                      className="w-4 h-4 accent-[#C6FF4D] rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium text-white flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#C6FF4D]" />
                      Track Scans & Analytics
                    </span>
                  </label>

                  <span className="text-xs text-[#A3E635] bg-[#A3E635]/10 px-2 py-0.5 rounded font-mono">
                    {enableTracking ? 'Active Redirect' : 'Direct Link'}
                  </span>
                </div>

                {enableTracking && (
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#888]">Trackable Short URL</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#C6FF4D]/15 text-[#C6FF4D] font-mono font-semibold">
                          PROD CLOUD
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDomainEditor(!showDomainEditor)}
                          className="text-[#888] hover:text-white flex items-center gap-1 text-[11px]"
                          title="Configure production domain"
                        >
                          <Globe className="w-3 h-3" />
                          {showDomainEditor ? 'Close Domain' : 'Domain'}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyTrackingLink(trackingUrl)}
                          className="text-[#C6FF4D] hover:underline flex items-center gap-1 text-[11px]"
                        >
                          {copiedLink === trackingUrl ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </div>

                    {showDomainEditor && (
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#888]">
                          <span>Production Base Domain:</span>
                          <button
                            type="button"
                            onClick={() => setProductionDomain(DEFAULT_PRODUCTION_URL)}
                            className="text-[#C6FF4D] hover:underline text-[10px]"
                          >
                            Reset to Default
                          </button>
                        </div>
                        <input
                          type="text"
                          value={productionDomain}
                          onChange={(e) => setProductionDomain(e.target.value)}
                          placeholder="https://cluster-club.vercel.app"
                          className="w-full px-2.5 py-1.5 rounded-md bg-black border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-[#C6FF4D]"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs font-mono text-white bg-black px-3 py-2 rounded-lg border border-white/10 overflow-x-auto">
                      <span className="text-[#666] shrink-0">{trackingOrigin}/r/</span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder={activeSlug}
                        className="bg-transparent text-[#C6FF4D] font-bold focus:outline-none w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveToLibrary}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#C6FF4D] hover:bg-[#D4FF73] text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#C6FF4D]/10"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved to Supabase DB & Tracking Active!
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" />
                        Save QR to Database & Track Scans
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Color Themes & Palette */}
            <div className="p-5 rounded-2xl bg-[#0C0D0E] border border-white/10 space-y-4">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C6FF4D]" />
                Color Theme Preset
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${selectedThemeId === theme.id
                        ? 'border-[#C6FF4D] bg-[#C6FF4D]/10 text-white'
                        : 'border-white/10 bg-black/40 text-[#999] hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-white/20" style={{ background: theme.bg }} />
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: theme.lightDot }} />
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: theme.eyeOuter }} />
                    </div>
                    <span className="text-xs font-medium leading-tight">{theme.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Fine-Tuning Colors */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                <div>
                  <span className="text-[11px] text-[#888] block mb-1">Canvas Background</span>
                  <div className="flex items-center gap-2 bg-black px-2.5 py-1.5 rounded-lg border border-white/10">
                    <input
                      type="color"
                      value={customBg.startsWith('#') ? customBg : '#808080'}
                      onChange={(e) => {
                        setCustomBg(e.target.value)
                        setSelectedThemeId('custom')
                      }}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-white">{customBg}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#888] block mb-1">Light Glow Dots</span>
                  <div className="flex items-center gap-2 bg-black px-2.5 py-1.5 rounded-lg border border-white/10">
                    <input
                      type="color"
                      value={customLightDot.startsWith('#') ? customLightDot : '#FFFFFF'}
                      onChange={(e) => {
                        setCustomLightDot(e.target.value)
                        setSelectedThemeId('custom')
                      }}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-white">{customLightDot}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#888] block mb-1">Corner Eye Separator</span>
                  <div className="flex items-center gap-2 bg-black px-2.5 py-1.5 rounded-lg border border-white/10">
                    <input
                      type="color"
                      value={customEyeOuter.startsWith('#') ? customEyeOuter : '#FFFFFF'}
                      onChange={(e) => {
                        setCustomEyeOuter(e.target.value)
                        setSelectedThemeId('custom')
                      }}
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-white">{customEyeOuter}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Artwork & Background Mode */}
            <div className="p-5 rounded-2xl bg-[#0C0D0E] border border-white/10 space-y-4">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C6FF4D]" />
                Background Artwork
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setArtworkMode('cluster-emblem')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${artworkMode === 'cluster-emblem'
                      ? 'bg-[#C6FF4D] text-black border-[#C6FF4D] font-semibold'
                      : 'bg-black text-[#CCC] border-white/10 hover:border-white/20'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Cluster Emblem + Sparks (Reference)
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${artworkMode === 'uploaded'
                      ? 'bg-[#C6FF4D] text-black border-[#C6FF4D] font-semibold'
                      : 'bg-black text-[#CCC] border-white/10 hover:border-white/20'
                    }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Custom Artwork / Poster
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => setArtworkMode('none')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${artworkMode === 'none'
                      ? 'bg-[#C6FF4D] text-black border-[#C6FF4D] font-semibold'
                      : 'bg-black text-[#888] border-white/10 hover:border-white/20'
                    }`}
                >
                  None (Pure Dot Matrix)
                </button>
              </div>

              {artworkMode !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                  <div>
                    <div className="flex justify-between text-xs text-[#888] mb-1.5">
                      <span>Artwork Size</span>
                      <span className="font-mono text-white">{artworkScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="95"
                      value={artworkScale}
                      onChange={(e) => setArtworkScale(Number(e.target.value))}
                      className="w-full accent-[#C6FF4D] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#888] mb-1.5">
                      <span>Artwork Opacity</span>
                      <span className="font-mono text-white">{artworkOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={artworkOpacity}
                      onChange={(e) => setArtworkOpacity(Number(e.target.value))}
                      className="w-full accent-[#C6FF4D] cursor-pointer"
                    />
                    <span className="text-[10px] text-[#666] block mt-1">
                      Safe range: 15% - 25% ensures 100% phone camera readability.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Geometry & Dot Controls */}
            <div className="p-5 rounded-2xl bg-[#0C0D0E] border border-white/10 space-y-4">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C6FF4D]" />
                Halftone Matrix & Corner Eyes
              </label>

              {/* Corner Eye Shapes */}
              <div>
                <span className="text-xs text-[#777] font-medium block mb-2">Corner Finder Eye Shape</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'diamond', label: 'Diamond (Reference)' },
                    { id: 'squircle', label: 'Tech Squircle' },
                    { id: 'circle', label: 'Circular Eye' },
                    { id: 'classic', label: 'Classic Square' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setEyeStyle(style.id)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${eyeStyle === style.id
                          ? 'bg-white/15 text-white border-[#C6FF4D]'
                          : 'bg-black/50 text-[#888] border-white/10 hover:border-white/20'
                        }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-[#888] mb-1.5">
                    <span>Dark Dot Radius (Halftone)</span>
                    <span className="font-mono text-white">{dotScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="48"
                    value={dotScale}
                    onChange={(e) => setDotScale(Number(e.target.value))}
                    className="w-full accent-[#C6FF4D] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#666] block mt-1">
                    Optimal: 40% - 46% for instant phone scan lock-on.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#888] mb-1.5">
                    <span>Light Module Micro-Dots</span>
                    <span className="font-mono text-white">{microDotScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="22"
                    value={microDotScale}
                    onChange={(e) => setMicroDotScale(Number(e.target.value))}
                    className="w-full accent-[#C6FF4D] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#666] block mt-1">
                    Aesthetic halftone matrix pattern without optical interference.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview & Analytics Column (5 cols) */}
          <div className="lg:col-span-5 sticky top-8 space-y-6">
            <div className="p-6 rounded-3xl bg-[#0C0D0E] border border-white/10 shadow-2xl flex flex-col items-center gap-6">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A0A0A0] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#C6FF4D]" />
                  Live Scannable Canvas
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${artworkOpacity > 38
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                    : 'text-[#C6FF4D] bg-[#C6FF4D]/15 border-[#C6FF4D]/30'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${artworkOpacity > 38 ? 'bg-amber-400' : 'bg-[#C6FF4D] animate-ping'}`} />
                  {artworkOpacity > 38 ? 'Notice: High Opacity' : '100% Scannable'}
                </span>
              </div>

              {/* The Live Rendered Canvas */}
              <div className="relative p-3 rounded-2xl bg-black/60 border border-white/10 shadow-inner max-w-full overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="rounded-xl max-w-full h-auto w-[340px] sm:w-[380px] aspect-square shadow-2xl transition-transform"
                />
              </div>

              {/* Download / Copy Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => downloadPNG(1024)}
                  className="btn-cluster-primary py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save PNG (1024px)
                </button>
                <button
                  onClick={copyImage}
                  className="btn-cluster-secondary py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#C6FF4D]" />
                      Copied Image!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>

              {/* Scan tips banner */}
              <div className="w-full p-3.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#888] leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#C6FF4D] shrink-0 mt-0.5" />
                <p>
                  Settings auto-saved! When scanned, this code routes to{' '}
                  <span className="text-[#C6FF4D] font-mono">{enableTracking ? `/r/${activeSlug}` : destinationUrl}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Generated QRs & Scan Analytics Dashboard ── */}
        <div className="mt-12 pt-8 border-t border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-[#C6FF4D]" />
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Generated QRs & Scan Analytics
                </h2>
              </div>
              <p className="text-xs text-[#888] mt-1">
                Real-time scan counter and historical library of your created QR codes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-[#0C0D0E] border border-white/10 flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[#C6FF4D]" />
                <span className="text-xs text-[#888]">Total Scans:</span>
                <span className="text-sm font-bold text-white font-mono">{totalScans}</span>
              </div>
            </div>
          </div>

          {qrHistory.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0C0D0E] border border-white/10 text-center space-y-3">
              <QrCode className="w-10 h-10 text-[#555] mx-auto" />
              <h3 className="text-sm font-semibold text-white">No Saved QR Codes Yet</h3>
              <p className="text-xs text-[#888] max-w-sm mx-auto">
                Customize your QR code above and click <strong>&quot;Save QR to Library & Track Scans&quot;</strong> to start monitoring real-time scans!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qrHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#0C0D0E] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#C6FF4D]/15 text-[#C6FF4D] border border-[#C6FF4D]/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF4D]" />
                        {item.scans || 0} scans
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-[#888] flex items-center gap-1.5">
                        <span className="text-[#555]">To:</span>
                        <a
                          href={item.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#CCC] hover:text-[#C6FF4D] truncate max-w-[220px] font-mono text-[11px]"
                        >
                          {item.destinationUrl}
                        </a>
                      </div>

                      <div className="text-xs text-[#888] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#888]">
                          /r/<span className="text-white">{item.slug}</span>
                        </span>
                        <button
                          onClick={() => copyTrackingLink(getCleanTrackingUrl(item))}
                          className="text-[11px] text-[#C6FF4D] hover:underline"
                        >
                          {copiedLink === getCleanTrackingUrl(item) ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Timestamps */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLoadQR(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] flex items-center gap-1 transition-all"
                        title="Load this QR into studio editor"
                      >
                        <RotateCcw className="w-3 h-3 text-[#C6FF4D]" />
                        Load
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#666] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.lastScannedAt
                          ? new Date(item.lastScannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'No scans yet'}
                      </span>

                      <button
                        onClick={() => handleDeleteQR(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#666] hover:text-red-400 transition-colors"
                        title="Delete QR code"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
