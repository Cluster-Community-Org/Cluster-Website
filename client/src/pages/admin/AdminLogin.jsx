import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, ShieldCheck, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { ClusterMark } from '../../components/ui/Brand.jsx'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in both email and password.')
      setLoading(false)
      return
    }

    try {
      if (isSupabaseConfigured() && supabase) {
        // Authenticate with Supabase Auth
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          setError(authError.message)
          setLoading(false)
          return
        }

        // Store active session details
        localStorage.setItem(
          'cluster_admin_auth',
          JSON.stringify({
            email: data.user?.email || email,
            role: 'admin',
            userId: data.user?.id,
            provider: 'supabase',
            loggedInAt: new Date().toISOString(),
          })
        )
      } else {
        // Local Vault Mode (Development fallback)
        localStorage.setItem(
          'cluster_admin_auth',
          JSON.stringify({
            email,
            role: 'admin',
            provider: 'local-vault',
            loggedInAt: new Date().toISOString(),
          })
        )
      }

      showToast('Welcome to CLUSTER CMS Portal')
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const supabaseReady = isSupabaseConfigured()

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cluster-acid/[0.06] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Top Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8E8E88] hover:text-cluster-acid transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to public site</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl p-8 bg-[#0F1012] border border-white/[0.1] shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-black border border-white/15 p-1 flex items-center justify-center mx-auto shadow-cluster-glow">
              <ClusterMark className="w-10 h-10" sparkColor="#C6FF4D" markColor="#F8F8F5" />
            </div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight">
              CLUSTER CMS Portal
            </h1>
            <p className="text-xs text-[#8E8E88] font-sans">
              Restricted executive management dashboard for society administrators.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#D4D4CD]">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cluster.society"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-gray-500 text-xs font-sans focus:border-cluster-acid focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#D4D4CD]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-gray-500 text-xs font-sans focus:border-cluster-acid focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cluster-primary w-full py-3 rounded-xl text-xs font-semibold mt-2 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-black" />
                  <span>Enter Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Backend Indicator */}
          <div className="pt-3 border-t border-white/[0.08] flex flex-col items-center gap-1.5 text-[11px] font-mono text-[#8E8E88] text-center">
            <div className="flex items-center gap-1.5 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cluster-acid" />
              <span>Supabase Native Authentication</span>
            </div>
            <span className="text-[10px] text-gray-500">
              {supabaseReady
                ? 'Connected to Supabase Cloud'
                : 'Local Vault Dev Mode (Configure .env to connect Cloud)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
