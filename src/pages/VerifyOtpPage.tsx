import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Loader2, Mail } from 'lucide-react'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.post('/api/v1/business/verify-otp', { email, otpCode: otp })
      navigate('/login?verified=1')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    try {
      await api.post('/api/v1/business/resend-otp', { email })
      setResendCooldown(60)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Could not resend')
    }
  }

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
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
            <p className="text-sm text-slate-500">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-slate-700">{email}</span>
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full h-14 rounded-lg border border-slate-200 bg-white px-3 text-center text-3xl font-mono tracking-[0.4em] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Verifying…' : 'Verify email'}
            </button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-500">Didn't get the code?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
