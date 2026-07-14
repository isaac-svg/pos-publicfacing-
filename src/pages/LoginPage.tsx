import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

type Step = 'credentials' | 'otp'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [step, setStep]         = useState<Step>('credentials')
  const [username, setUsername] = useState('')
  const [companyCode, setCompanyCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [hint, setHint]           = useState('')
  const [sessionRef, setSessionRef] = useState('')
  const [otp, setOtp]             = useState('')
  const [cooldown, setCooldown]   = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Step 1: username + password → OTP sent to phone (or email fallback)
  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const code = companyCode.trim().toUpperCase()
      const res = await api.post('/api/v1/auth/login', {
        identifier: username.trim(),
        username:   username.trim(),
        companyCode: code,
        password,
      })
      const data = res.data.data as { otpRequired?: boolean; maskedPhone?: string; sessionRef?: string; token?: string; user?: object }

      if (data.token) {
        await finalise(data.token)
      } else {
        setHint(data.maskedPhone ?? '')
        setSessionRef(data.sessionRef ?? '')
        setStep('otp')
        setCooldown(60)
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Login failed',
      )
    } finally { setLoading(false) }
  }

  function scopedIdentifier() {
    const code = companyCode.trim().toUpperCase()
    return code ? `${username.trim()}@${code}` : username.trim()
  }

  // Step 2: OTP verification
  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/api/v1/auth/verify-login-otp', {
        sessionRef,
        otp,
      })
      await finalise(res.data.data.token)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Incorrect code',
      )
    } finally { setLoading(false) }
  }

  async function finalise(token: string) {
    // Get subscription status to decide where to route
    try {
      const subRes = await api.get('/api/v1/subscriptions/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const sub = subRes.data.data as { status: string; plan: string | null }
      // Store minimal business info — will be enriched by subscription status
      login(token, { id: 0, businessName: '' }, sub)
      switch (sub.status) {
        case 'no_plan_selected': navigate('/select-plan'); break
        case 'trial':            navigate('/dashboard'); break
        case 'pending_payment':  navigate('/pending'); break
        case 'active':           navigate('/dashboard'); break
        default:                 navigate('/dashboard'); break
      }
    } catch {
      // If subscription lookup fails, still get in — subscription page will sort it
      login(token, { id: 0, businessName: '' }, { status: 'trial', plan: null })
      navigate('/dashboard')
    }
  }

  async function resend() {
    setCooldown(60); setError('')
    try {
      const res = await api.post('/api/v1/auth/resend-otp', { sessionRef })
      setSessionRef(res.data.data.sessionRef)
    } catch { /* ignore */ }
  }

  if (step === 'credentials') return (
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
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in with your username and password</p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="e.g. kofi"
                autoComplete="username"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Company Code</label>
              <input
                type="text"
                value={companyCode}
                onChange={e => setCompanyCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                autoComplete="off"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                />
                <button
                  type="button"
                  title="Show or hide password"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Sending code...' : 'Continue'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:text-primary/80">Sign up free</Link>
          </p>
        </div>
      </main>
    </div>
  )

  // OTP step
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
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center text-xl">📱</div>
            <h1 className="text-2xl font-bold text-foreground">Enter your code</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <strong className="text-foreground">{hint}</strong>.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleOtp} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
              className="w-full h-14 rounded-lg border border-input bg-background px-3 text-center text-3xl font-mono tracking-[0.4em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Verifying...' : 'Log in'}
            </button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn't receive it?</p>
            <button
              onClick={resend}
              disabled={cooldown > 0}
              className="text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <button
            onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </main>
    </div>
  )
}
