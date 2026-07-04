import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'

type TokenType = 'business' | 'pos_user'
type PageState = 'loading' | 'invalid' | 'form' | 'success'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [pageState, setPageState] = useState<PageState>('loading')
  const [tokenType, setTokenType] = useState<TokenType | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [posUsername, setPosUsername] = useState('')

  useEffect(() => {
    if (!token) { setPageState('invalid'); return }
    api.get(`/api/v1/business/reset-token-info?token=${encodeURIComponent(token)}`)
      .then(res => {
        const { valid, tokenType: tt } = res.data.data
        if (valid) { setTokenType(tt as TokenType); setPageState('form') }
        else setPageState('invalid')
      })
      .catch(() => setPageState('invalid'))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      if (tokenType === 'business') {
        await api.post('/api/v1/business/reset-password', { token, newPassword: password })
      } else {
        const res = await api.post('/api/v1/auth/reset-password', { token, newPassword: password })
        setPosUsername(res.data.data.username)
      }
      setPageState('success')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Reset failed - the link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const sharedHeader = (
    <header className="h-14 flex items-center px-6 border-b border-border">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-xs">S</span>
        </div>
        <span className="text-foreground font-semibold text-sm">Kixon</span>
      </Link>
    </header>
  )

  if (pageState === 'loading') return (
    <div className="min-h-screen bg-card flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      {sharedHeader}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Verifying link…
        </p>
      </div>
    </div>
  )

  if (pageState === 'invalid') return (
    <div className="min-h-screen bg-card flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      {sharedHeader}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 border border-red-100 flex items-center justify-center text-xl">❌</div>
          <h1 className="text-2xl font-bold text-foreground">Link expired or invalid</h1>
          <p className="text-sm text-muted-foreground">This password reset link has expired, already been used, or is invalid.</p>
          <Link to="/forgot-password" className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Request a new link
          </Link>
        </div>
      </main>
    </div>
  )

  if (pageState === 'success') return (
    <div className="min-h-screen bg-card flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      {sharedHeader}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent border border-green-100 flex items-center justify-center text-xl">✅</div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Password reset!</h1>
            <p className="text-sm text-muted-foreground">
              {tokenType === 'business'
                ? 'Your password has been updated. You can now log in.'
                : 'Your Kixon password has been updated.'}
            </p>
          </div>

          {tokenType === 'pos_user' && posUsername && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-left space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your POS login</p>
              <p className="text-sm font-mono text-foreground">Username: <strong>{posUsername}</strong></p>
              <p className="text-xs text-muted-foreground">Use the new password you just set</p>
            </div>
          )}

          {tokenType === 'business' && (
            <Link to="/login" className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
              Go to login
            </Link>
          )}
        </div>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-card flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      {sharedHeader}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
            <p className="text-sm text-muted-foreground">
              {tokenType === 'pos_user' ? 'Resetting your Kixon app password.' : 'Resetting your Kixon portal password.'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <button type="button" title="Show or hide password" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Updating…' : 'Reset password'}
            </button>
          </form>

          <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </main>
    </div>
  )
}
