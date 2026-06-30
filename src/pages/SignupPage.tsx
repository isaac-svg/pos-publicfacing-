import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ businessName: '', email: '', phone: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!form.phone.trim()) { setError('Phone number is required'); return }

    setLoading(true)
    try {
      const res = await api.post('/api/v1/business/signup', {
        businessName: form.businessName,
        ownerEmail: form.email || undefined,
        ownerPhone: form.phone,
        password: form.password,
      })
      if (res.data.data.needsEmailVerification && form.email) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`)
      } else {
        navigate('/login?verified=1')
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const pwStrong = form.password.length >= 8

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
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
          {/* Trial badge */}
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Check className="w-3 h-3" /> 14-day free trial · No card required
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">Create your account</h1>
            <p className="text-sm text-slate-500">Get your shop running in under 30 minutes</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Business name</label>
              <input
                value={form.businessName}
                onChange={set('businessName')}
                required
                placeholder="e.g. Kofi's Provision Shop"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                required
                placeholder="024XXXXXXX"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Email <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="kofi@example.com"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <p className={`text-xs flex items-center gap-1 ${pwStrong ? 'text-green-600' : 'text-slate-400'}`}>
                  <Check className="w-3 h-3" />
                  {pwStrong ? 'Password is strong enough' : 'At least 8 characters required'}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                required
                placeholder="Repeat your password"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
