import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2, Eye, EyeOff, Mail, MessageSquare } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

type Step = 'credentials' | 'otp'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const verified = params.get('verified') === '1'
  const { login } = useAuthStore()

  // Step 1
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [showPw, setShowPw]         = useState(false)

  // Step 2
  const [otp, setOtp]           = useState('')
  const [channel, setChannel]   = useState<'email' | 'sms'>('email')
  const [hint, setHint]         = useState('')
  const [cooldown, setCooldown] = useState(0)

  const [step, setStep]       = useState<Step>('credentials')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Countdown for resend
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/api/v1/business/login', {
        email: identifier.trim(),
        password,
      })
      const { channel: ch, hint: h } = res.data.data
      setChannel(ch)
      setHint(h)
      setStep('otp')
      setCooldown(60)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Login failed',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/api/v1/business/verify-login-otp', {
        identifier: identifier.trim(),
        otpCode: otp,
      })
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
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Verification failed',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(''); setCooldown(60)
    try {
      await api.post('/api/v1/business/login', {
        email: identifier.trim(),
        password,
      })
    } catch { /* ignore - code already sent */ }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: '"Geist Variable","Geist",system-ui,sans-serif' }}>
      {/* Header */}
      <header className="h-14 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">S</span>
          </div>
          <span className="text-foreground font-semibold text-sm">Shepherd</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">

          {/* ── Step 1: Credentials ────────────────────────────── */}
          {step === 'credentials' && (
            <>
              <div className="space-y-1 text-center">
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Log in to your Shepherd account</p>
              </div>

              {verified && (
                <div className="rounded-lg bg-accent/50 border border-accent px-4 py-3 text-sm text-accent-foreground">
                  Email verified - you can now log in.
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleCredentials} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email or Phone</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    placeholder="kofi@example.com or 024XXXXXXX"
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
                  {loading ? 'Sending code…' : 'Continue'}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:text-primary/80">
                  Sign up free
                </Link>
              </p>
            </>
          )}

          {/* ── Step 2: OTP ────────────────────────────────────── */}
          {step === 'otp' && (
            <>
              <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  {channel === 'email'
                    ? <Mail className="w-5 h-5 text-accent-foreground" />
                    : <MessageSquare className="w-5 h-5 text-accent-foreground" />
                  }
                </div>
                <h1 className="text-2xl font-bold text-foreground">Enter your code</h1>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-foreground">{hint}</span>{' '}
                  via {channel === 'email' ? 'email' : 'SMS'}.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Verification code</label>
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
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Verifying…' : 'Log in'}
                </button>
              </form>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Didn't receive it?</p>
                <button
                  onClick={handleResend}
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
                ← Back to login
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
