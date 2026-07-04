import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'

const inputCls = 'w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    businessName: '',
    username: '',
    shopName: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const pwStrong = form.password.length >= 8

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (!pwStrong) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      await api.post('/api/v1/business/signup', {
        businessName: form.businessName.trim(),
        username:     form.username.trim(),
        shopName:     form.shopName.trim(),
        ownerPhone:   form.phone.trim(),
        ownerEmail:   form.email.trim() || undefined,
        password:     form.password,
      })
      // Always redirect to OTP page using phone number
      navigate(`/verify-otp?phone=${encodeURIComponent(form.phone.trim())}`)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Signup failed',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: '"Geist Variable","Geist",system-ui,sans-serif' }}>
      <header className="h-14 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">S</span>
          </div>
          <span className="text-foreground font-semibold text-sm">Kixon</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent text-primary border border-indigo-100">
              <Check className="w-3 h-3" /> 14-day free trial · No card required
            </span>
            <h1 className="text-2xl font-bold text-foreground mt-3">Create your account</h1>
            <p className="text-sm text-muted-foreground">Get your shop running in minutes</p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Business name <span className="text-destructive">*</span></label>
              <input value={form.businessName} onChange={set('businessName')} required placeholder="e.g. Kofi's Provision Shop" className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Username <span className="text-destructive">*</span></label>
              <input
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                required
                placeholder="e.g. kofistore"
                className={inputCls}
              />
              <p className="text-xs text-muted-foreground">Used to log in on the desktop app. Letters, numbers, hyphens and underscores only.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Shop name <span className="text-destructive">*</span></label>
              <input value={form.shopName} onChange={set('shopName')} required placeholder="e.g. Main Branch" className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone number <span className="text-destructive">*</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} required placeholder="024XXXXXXX" className={inputCls} />
              <p className="text-xs text-muted-foreground">A verification code will be sent to this number.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="kofi@example.com" className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Minimum 8 characters"
                  className={`${inputCls} pr-10`}
                />
                <button type="button" title="Show or hide password" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <p className={`text-xs flex items-center gap-1 ${pwStrong ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                  <Check className="w-3 h-3" />{pwStrong ? 'Password is strong enough' : 'At least 8 characters required'}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm password <span className="text-destructive">*</span></label>
              <input type="password" value={form.confirm} onChange={set('confirm')} required placeholder="Repeat your password" className={inputCls} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-primary">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
