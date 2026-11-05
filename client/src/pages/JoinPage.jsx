import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Hash,
  GraduationCap,
  GitBranch,
  Calendar,
  Code,
  Github,
  Linkedin,
  MessageSquare,
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Users,
  Terminal,
} from 'lucide-react'
import { clusterDataService } from '../services/clusterDataService.js'
import { useToast } from '../context/ToastContext.jsx'

const DOMAINS = [
  'AI & Machine Learning',
  'Full-Stack Web Dev',
  'Mobile & Systems',
  'Design & Creative Tech',
  'Cloud & DevOps',
  'Open Source & Dev Tools',
]

const COURSES = [
  'B.Tech',
  'BCA',
  'MCA',
  'M.Tech',
  'B.Sc Computer Science',
  'Dual Degree (B.Tech + M.Tech)',
  'Other Degree',
]

const BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'AI & Data Science (AIDS)',
  'AI & Machine Learning (AIML)',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering',
  'Other Branch',
]

const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate / Research',
]

export default function JoinPage() {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering (CSE)',
    year: '1st Year',
    domain: DOMAINS[0],
    github: '',
    linkedin: '',
    motivation: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedApp, setSubmittedApp] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Determine current live URL for QR code
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join`
    : 'https://cluster-club.vercel.app/join'

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=24&color=080808&bgcolor=FFFFFF&data=${encodeURIComponent(currentUrl)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopiedLink(true)
    showToast('Link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const branchYear = `${formData.course} · ${formData.branch} · ${formData.year}`
    const payload = {
      ...formData,
      branchYear,
    }

    setTimeout(() => {
      const app = clusterDataService.addApplication(payload)
      setSubmittedApp(app)
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      showToast('Application submitted successfully!', 'success')
    }, 400)
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F8F7F3] pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cluster-acid/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono font-bold tracking-widest text-cluster-acid uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-cluster-acid shadow-[0_0_8px_rgba(198,255,77,0.8)]" />
              <span>CLUSTER SOCIETY // STUDENT RECRUITMENT 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.08]">
              Find your people.<br />
              <span className="text-cluster-gradient">Build what's next.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#C2C2B8] font-sans leading-relaxed pt-1">
              A community around compute, engineering, and shared curiosity. Apply below to join our focused developer circles, build production software, and access mentorship.
            </p>
          </div>

          {/* QR Code Action Card */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setShowQrModal(true)}
              className="btn-cluster-secondary px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 group cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-cluster-acid group-hover:scale-110 transition-transform" />
              <span>Get Shareable QR</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="btn-cluster-secondary px-3.5 py-2.5 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              title="Copy page link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
            </button>
          </div>
        </div>

        {submittedApp ? (
          /* Application Submitted Success View */
          <div className="max-w-2xl mx-auto py-12 px-6 sm:px-10 rounded-3xl bg-[#0F1012] border border-cluster-acid/30 shadow-[0_0_50px_rgba(198,255,77,0.06)] text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-cluster-acid/15 border border-cluster-acid/40 text-cluster-acid flex items-center justify-center mx-auto shadow-cluster-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold tracking-widest text-cluster-acid uppercase">
                APPLICATION RECEIVED
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                Welcome to the Queue, {submittedApp.fullName}!
              </h2>
              <p className="text-xs sm:text-sm text-[#8E8E88] font-sans max-w-md mx-auto leading-relaxed">
                Your application has been registered for <strong className="text-white">{submittedApp.domain}</strong>.
                Our core leads will review your profile and reach out via email.
              </p>
            </div>

            {/* Candidate Receipt Card */}
            <div className="p-4 rounded-2xl bg-black border border-white/[0.08] text-left text-xs font-mono space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-[#8E8E88]">Application Ref:</span>
                <span className="text-cluster-acid font-bold">{submittedApp.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E88]">Roll / Student ID:</span>
                <span className="text-white">{submittedApp.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E88]">Academic Standing:</span>
                <span className="text-white truncate max-w-[220px]">{submittedApp.branchYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E88]">Pipeline Status:</span>
                <span className="text-amber-400 font-bold">Pending Review</span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/events"
                className="btn-cluster-primary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Explore Upcoming Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="btn-cluster-secondary w-full sm:w-auto px-6 py-2.5 text-xs font-semibold"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* Main Layout: Perks/Culture Left + Application Form Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Why Join & Pipeline Process (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Society Pillars */}
              <div className="rounded-3xl p-6 sm:p-7 bg-[#0F1012] border border-white/[0.08] space-y-5">
                <div className="text-xs font-mono font-bold text-cluster-acid uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>WHAT AWAITS YOU AT CLUSTER</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                      01
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-white">Focused Build Circles</h4>
                      <p className="text-xs text-[#8E8E88] font-sans mt-0.5 leading-relaxed">
                        Join dedicated tracks in AI/ML, full-stack systems, systems programming, and cloud infrastructure.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                      02
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-white">Hackathons & High-Stakes Sprints</h4>
                      <p className="text-xs text-[#8E8E88] font-sans mt-0.5 leading-relaxed">
                        Multidisciplinary teams competing in national hackathons with compute sponsorships and hardware support.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-cluster-acid/10 border border-cluster-acid/30 text-cluster-acid flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                      03
                    </div>
                    <div>
                      <h4 className="text-sm font-display font-bold text-white">Peer Leadership & Mentorship</h4>
                      <p className="text-xs text-[#8E8E88] font-sans mt-0.5 leading-relaxed">
                        Direct code reviews, system design sessions, and open collaboration. No gatekeeping.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recruitment Timeline Card */}
              <div className="rounded-3xl p-6 bg-[#0F1012] border border-white/[0.08] space-y-4">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-cluster-acid" />
                  <span>INDUCTION TIMELINE</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-white/[0.06]">
                    <span className="text-gray-400">1. Online Application</span>
                    <span className="text-cluster-acid font-bold">Open Now</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-white/[0.06]">
                    <span className="text-gray-400">2. Portfolio / Shortlisting</span>
                    <span className="text-white">Within 48h</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-white/[0.06]">
                    <span className="text-gray-400">3. Informal 1:1 Chat</span>
                    <span className="text-white">On Campus / Meet</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-white/[0.06]">
                    <span className="text-gray-400">4. Circle Onboarding</span>
                    <span className="text-cluster-acid font-bold">Cohort '26</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: The Application Form (7 cols) */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl p-6 sm:p-8 bg-[#0F1012] border border-white/[0.08] space-y-6 shadow-xl"
              >
                <div>
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">
                    Submit Candidate Profile
                  </h3>
                  <p className="text-xs text-[#8E8E88] font-sans mt-0.5">
                    All tech students are welcome regardless of branch or graduation year.
                  </p>
                </div>

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Diya Patel"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. diya.p@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                    />
                  </div>
                </div>

                {/* Roll Number & Course */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>University Roll / Student ID *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 23SCSE102045"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-mono placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>Degree Program / Course *</span>
                    </label>
                    <select
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c} className="bg-[#141517] text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Branch & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>Branch / Specialization *</span>
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b} className="bg-[#141517] text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>Current Academic Year *</span>
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y} className="bg-[#141517] text-white">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preferred Domain */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-cluster-acid" />
                    <span>Primary Domain Interest *</span>
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d} className="bg-[#141517] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* GitHub & LinkedIn Profiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>GitHub Profile (Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="https://github.com/yourhandle"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-mono placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>LinkedIn Profile (Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/yourhandle"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-mono placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                    />
                  </div>
                </div>

                {/* Motivation / SOP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#D4D4CD] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-cluster-acid" />
                      <span>Why CLUSTER? What do you want to build?</span>
                    </span>
                    <span className="text-[11px] text-[#8E8E88] font-normal">Optional but valued</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Tell us about a project you worked on, a tech stack you love, or what you want to build alongside peers..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08]">
                  <p className="text-[11px] text-[#8E8E88] font-sans">
                    Submissions are synced to the live review pipeline.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-cluster-primary w-full sm:w-auto px-7 py-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <span>{isSubmitting ? 'Transmitting...' : 'Submit Membership Application'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Shareable QR Code Modal */}
      {showQrModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-[#0F1012] border border-white/[0.1] p-6 sm:p-7 shadow-2xl text-center space-y-5"
            role="dialog"
            aria-modal="true"
          >
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold tracking-widest text-cluster-acid uppercase">
                PRINT & PROJECTOR READY
              </div>
              <h3 className="text-xl font-display font-black text-white">
                Scan to Join CLUSTER
              </h3>
              <p className="text-xs text-[#8E8E88] font-sans">
                Scan using any phone camera to open this recruitment form directly.
              </p>
            </div>

            {/* High-Resolution QR Card */}
            <div className="p-4 rounded-2xl bg-white mx-auto inline-block shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <img
                src={qrImageUrl}
                alt="QR Code for CLUSTER Join Application"
                className="w-56 h-56 object-contain rounded-lg"
              />
            </div>

            <div className="text-[11px] font-mono text-gray-400 break-all bg-black p-2.5 rounded-xl border border-white/[0.08]">
              {currentUrl}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={qrImageUrl}
                download="cluster_join_qr_code.png"
                target="_blank"
                rel="noreferrer"
                className="btn-cluster-primary flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Save QR Image</span>
              </a>

              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClockIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
