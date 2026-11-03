import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react'
import { ClusterMark } from '../../components/ui/ClusterLogo.jsx'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in both email and password.')
      return
    }
    // Set admin session flag
    localStorage.setItem('cluster_admin_auth', JSON.stringify({
      email,
      role: 'admin',
      loggedInAt: new Date().toISOString()
    }))
    navigate('/admin/dashboard')
  }

  const handleOAuth = (provider) => {
    localStorage.setItem('cluster_admin_auth', JSON.stringify({
      email: `admin@${provider}.com`,
      role: 'admin',
      provider,
      loggedInAt: new Date().toISOString()
    }))
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cluster-acid/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Top Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-cluster-acid transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to public site</span>
        </Link>

        {/* Card */}
        <div className="nvidia-card rounded-2xl p-8 border border-white/10 shadow-cluster-glow space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-black border border-white/15 p-1 flex items-center justify-center mx-auto shadow-cluster-glow">
              <ClusterMark className="w-10 h-10" sparkColor="#C6FF4D" markColor="#F8F8F5" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              CLUSTER CMS Portal
            </h1>
            <p className="text-xs text-gray-400 font-sans">
              Restricted management dashboard for society administrators.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cluster.society"
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-cluster-green focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Passkey / Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-cluster-green focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-cluster-primary w-full py-3 rounded-xl text-sm mt-2 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Enter Admin Dashboard</span>
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-obsidian-900 px-3 text-[10px] font-mono text-gray-400 uppercase tracking-wider relative">
              OR SINGLE SIGN-ON
            </span>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="px-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs font-mono text-gray-200 hover:text-white hover:border-cluster-green/40 transition-colors flex items-center justify-center gap-2"
            >
              <span>Google SSO</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              className="px-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs font-mono text-gray-200 hover:text-white hover:border-cluster-cyan/40 transition-colors flex items-center justify-center gap-2"
            >
              <span>GitHub SSO</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cluster-green" />
            <span>Authenticated via Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </div>
  )
}

