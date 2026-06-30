import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Loader2, ArrowLeft, Mail, Phone } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/api/v1/business/forgot-password', { identifier: identifier.trim() })
      setDone(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      if (!msg) { setDone(true); return }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-card flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      <header className="h-14 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-foreground font-semibold text-sm">Shepherd</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          {done ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                {isEmail
                  ? <Mail className="w-5 h-5 text-accent-foreground" />
                  : <Phone className="w-5 h-5 text-accent-foreground" />
                }
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Check your {isEmail ? 'email' : 'SMS'}</h1>
                <p className="text-sm text-muted-foreground">
                  If <strong className="text-foreground">{identifier}</strong> is registered, you'll receive a reset link shortly. It expires in 30 minutes.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {isEmail
                  ? "Didn't receive it? Check your spam folder or try again."
                  : "Didn't receive it? Double-check the number is correct and try again."}
              </p>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email address or phone number. We'll send a reset link to you.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email or Phone number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {isEmail ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      required
                      placeholder="e.g. kofi@email.com or 024 123 4567"
                      className="w-full h-10 rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
                    />
                  </div>
                  {identifier.trim().length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      {isEmail ? 'Reset link will be sent via email' : 'Reset link will be sent via SMS'}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
