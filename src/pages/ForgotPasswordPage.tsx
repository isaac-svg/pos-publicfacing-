import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Loader2, ArrowLeft, Mail, Phone, Eye, EyeOff } from 'lucide-react'

type Step = 'identifier' | 'otp' | 'new-password' | 'email-sent' | 'success'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [_channel, setChannel] = useState<'sms' | 'email'>('sms')
  const [hint, setHint] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function submitIdentifier(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/v1/business/forgot-password', { identifier: identifier.trim() })
      const data = res.data.data as { channel: 'sms' | 'email'; otpRequired: boolean; hint: string }
      setChannel(data.channel)
      setHint(data.hint)
      if (data.otpRequired) {
        setStep('otp')
        setCooldown(60)
      } else {
        setStep('email-sent')
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Something went wrong')
    } finally { setLoading(false) }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/v1/business/verify-reset-otp', { phone: identifier.trim(), otp })
      setResetToken(res.data.data.resetToken)
      setStep('new-password')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Incorrect code')
    } finally { setLoading(false) }
  }

  async function resend() {
    setCooldown(60); setError('')
    try {
      await api.post('/api/v1/business/forgot-password', { identifier: identifier.trim() })
    } catch { /* ignore */ }
  }

  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      await api.post('/api/v1/business/reset-password', { token: resetToken, newPassword: password })
      setStep('success')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Reset failed')
    } finally { setLoading(false) }
  }

  const base = 'min-h-screen bg-card flex flex-col'
  const hdrStyle = { fontFamily: '"Geist Variable","Geist",system-ui,sans-serif' }

  function Header() {
    return (
      <header className="h-14 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-foreground font-semibold text-sm">Shepherd</span>
        </Link>
      </header>
    )
  }

  // ── Step 1: Identifier ────────────────────────────────────────────────────
  if (step === 'identifier') return (
    <div className={base} style={hdrStyle}>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
            <p className="text-sm text-muted-foreground">Enter your email or phone number to reset your password.</p>
          </div>
          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={submitIdentifier} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email or Phone</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isEmail ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  placeholder="kofi@email.com or 024 123 4567"
                  className="w-full h-10 rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                />
              </div>
              {identifier.trim().length > 2 && (
                <p className="text-xs text-muted-foreground">
                  {isEmail ? 'We will send a reset link to your email' : 'We will send a 6-digit code via SMS'}
                </p>
              )}
            </div>
            <button type="submit" disabled={loading || !identifier.trim()} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Sending...' : 'Continue'}
            </button>
          </form>
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </main>
    </div>
  )

  // ── Step 2 (phone): OTP ───────────────────────────────────────────────────
  if (step === 'otp') return (
    <div className={base} style={hdrStyle}>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Phone className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Enter your code</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit reset code to <strong className="text-foreground">{hint}</strong> via SMS.
            </p>
          </div>
          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={submitOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Reset code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
                className="w-full h-14 rounded-lg border border-border bg-card text-center text-3xl font-mono tracking-[0.4em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
              />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
          </form>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Didn't receive it?</p>
            <button onClick={resend} disabled={cooldown > 0} className="text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed">
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
          <button onClick={() => { setStep('identifier'); setOtp(''); setError('') }} className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Change email or phone
          </button>
        </div>
      </main>
    </div>
  )

  // ── Step 3 (phone): New password ──────────────────────────────────────────
  if (step === 'new-password') return (
    <div className={base} style={hdrStyle}>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
            <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
          </div>
          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={submitNewPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">New password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                />
                <button type="button" title="Show or hide password" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Repeat your new password"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save new password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )

  // ── Email sent confirmation ────────────────────────────────────────────────
  if (step === 'email-sent') return (
    <div className={base} style={hdrStyle}>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Mail className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If <strong className="text-foreground">{hint}</strong> is registered, a reset link has been sent. It expires in 30 minutes.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Check your spam folder if you don't see it.</p>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </main>
    </div>
  )

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <div className={base} style={hdrStyle}>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="text-3xl">✅</div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Password updated!</h1>
            <p className="text-sm text-muted-foreground">Your password has been changed. You can now log in.</p>
          </div>
          <button onClick={() => navigate('/login')} className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Go to login
          </button>
        </div>
      </main>
    </div>
  )
}
