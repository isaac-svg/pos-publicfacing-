import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const verified = params.get('verified') === '1'
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/api/v1/business/login', { email, password })
      const { token, business, subscription } = res.data.data
      login(token, business, subscription)
      switch (subscription.status) {
        case 'no_plan_selected': navigate('/select-plan'); break
        case 'trial':            navigate('/dashboard'); break
        case 'pending_payment':  navigate('/pending'); break
        case 'active':           navigate('/dashboard'); break
        default:                 navigate('/pending'); break
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      {/* Minimal header */}
      <header className="h-14 flex items-center px-6 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-slate-900 font-semibold text-sm">Shepherd</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Log in to manage your subscription and shop</p>
          </div>

          {verified && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Email verified — you can now log in.
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email or Phone</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="kofi@example.com or 024XXXXXXX"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-medium hover:text-indigo-700">Sign up free</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
