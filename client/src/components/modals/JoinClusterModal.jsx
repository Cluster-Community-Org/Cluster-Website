import { useState } from 'react'
import { X, CheckCircle2, ArrowRight, Sparkles, User, Mail, Hash, BookOpen, Code, Github, Linkedin, MessageSquare } from 'lucide-react'
import { clusterDataService } from '../../services/clusterDataService.js'

const DOMAINS = [
  'AI & Machine Learning',
  'Full-Stack Web Dev',
  'Mobile & Systems',
  'Design & Creative Tech',
  'Cloud & DevOps',
  'Open Source & Dev Tools',
]

const YEARS = [
  '1st Year (2028)',
  '2nd Year (2027)',
  '3rd Year (2026)',
  '4th Year (2025)',
  'Postgraduate / Other',
]

export default function JoinClusterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rollNumber: '',
    branchYear: 'CSE / 2nd Year',
    domain: DOMAINS[0],
    github: '',
    linkedin: '',
    motivation: '',
  })
  const [submittedApp, setSubmittedApp] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      const app = clusterDataService.addApplication(formData)
      setSubmittedApp(app)
      setIsSubmitting(false)
    }, 400)
  }

  const handleReset = () => {
    setSubmittedApp(null)
    setFormData({
      fullName: '',
      email: '',
      rollNumber: '',
      branchYear: 'CSE / 2nd Year',
      domain: DOMAINS[0],
      github: '',
      linkedin: '',
      motivation: '',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0C0D0E] border border-white/[0.1] p-6 sm:p-8 shadow-2xl text-[#F8F7F3] space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8E8E88] hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedApp ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-cluster-acid/15 border border-cluster-acid/40 text-cluster-acid flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold tracking-widest text-cluster-acid uppercase">
                APPLICATION SUBMITTED
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                Welcome, {submittedApp.fullName}!
              </h2>
              <p className="text-sm text-[#B5B5AE] max-w-md mx-auto font-sans leading-relaxed">
                Your application to join <strong className="text-white">CLUSTER</strong> has been logged in our registry. Our executive board reviews inductions continuously.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141517] border border-white/[0.08] max-w-md mx-auto text-left text-xs font-mono space-y-2">
              <div className="flex justify-between text-[#8E8E88]">
                <span>Reference ID:</span>
                <span className="text-white font-bold">{submittedApp.id}</span>
              </div>
              <div className="flex justify-between text-[#8E8E88]">
                <span>Primary Domain:</span>
                <span className="text-cluster-acid">{submittedApp.domain}</span>
              </div>
              <div className="flex justify-between text-[#8E8E88]">
                <span>Status:</span>
                <span className="text-white bg-white/10 px-2 py-0.5 rounded">Pending Review</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleReset}
                className="btn-cluster-primary px-8 py-3 text-sm font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono tracking-widest text-cluster-acid uppercase font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-cluster-acid" />
                <span>STUDENT INDUCTION APPLICATION</span>
              </div>
              <h2 id="join-modal-title" className="text-2xl sm:text-3xl font-display font-black text-white">
                Join the CLUSTER Community
              </h2>
              <p className="text-xs sm:text-sm text-[#B5B5AE] font-sans">
                A community around compute. Connect with peers, build ambitious projects, and learn practical skills.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
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
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                  />
                </div>

                {/* Email */}
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
                    placeholder="your.name@student.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                  />
                </div>

                {/* Roll Number / ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-cluster-acid" />
                    <span>Student / Roll Number *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g. 23SCSE101001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-mono placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                  />
                </div>

                {/* Branch & Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cluster-acid" />
                    <span>Branch & Year *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.branchYear}
                    onChange={(e) => setFormData({ ...formData, branchYear: e.target.value })}
                    placeholder="e.g. CSE / 2nd Year"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                  />
                </div>
              </div>

              {/* Primary Domain */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cluster-acid" />
                  <span>Primary Circle / Domain of Interest *</span>
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans focus:border-cluster-acid focus:outline-none"
                >
                  {DOMAINS.map((dom) => (
                    <option key={dom} value={dom} className="bg-[#141517] text-white">
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Links: GitHub & LinkedIn */}
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
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
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
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none"
                  />
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#D4D4CD] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cluster-acid" />
                  <span>Why do you want to join CLUSTER? (1–3 sentences)</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Tell us about the projects you want to build, tech you're curious about, or what you hope to collaborate on..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141517] border border-white/[0.08] text-white text-xs font-sans placeholder-gray-500 focus:border-cluster-acid focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#8E8E88] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-cluster-primary px-7 py-2.5 text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

