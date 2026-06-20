import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-gray-500 mt-1">We sent a 6-digit code to <strong>{email}</strong></p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Verification code</label>
            <input
              type="text" inputMode="numeric" maxLength={6}
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full h-12 rounded-md border px-3 text-center text-2xl font-mono tracking-[0.3em]"
              placeholder="000000"
            />
          </div>
          <button type="submit" disabled={loading || otp.length !== 6} className="w-full h-10 rounded-md bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </div>
    </div>
  )
}
