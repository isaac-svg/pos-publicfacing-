import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'

type TokenType = 'business' | 'pos_user'
type PageState = 'loading' | 'invalid' | 'form' | 'success'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [pageState, setPageState] = useState<PageState>('loading')
  const [tokenType, setTokenType] = useState<TokenType | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Reset failed. The link may have expired.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500 animate-pulse">Verifying reset link…</p>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 text-center space-y-4">
          <div className="text-3xl">❌</div>
          <h1 className="text-xl font-bold">Invalid or expired link</h1>
          <p className="text-sm text-gray-500">This password reset link is invalid, has expired, or has already been used.</p>
          <Link to="/forgot-password" className="inline-block text-sm text-blue-600 hover:underline">Request a new link</Link>
        </div>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 text-center space-y-4">
          <div className="text-3xl">✅</div>
          <h1 className="text-xl font-bold">Password reset!</h1>
          {tokenType === 'business' ? (
            <>
              <p className="text-sm text-gray-500">Your password has been updated. You can now log in to the Shepherd portal.</p>
              <Link to="/login" className="inline-block w-full h-10 rounded-md bg-blue-600 text-white font-medium text-sm leading-10 hover:bg-blue-700">
                Go to login
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Your Shepherd POS password has been updated.</p>
              <div className="bg-gray-50 rounded-md border p-4 text-left space-y-1">
                <p className="text-xs font-semibold text-gray-600">Your POS login credentials</p>
                <p className="text-sm font-mono">Username: <strong>{posUsername}</strong></p>
                <p className="text-sm text-gray-500">Use the new password you just set</p>
              </div>
              <p className="text-xs text-gray-400">Open the Shepherd POS app and log in with these credentials.</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tokenType === 'pos_user' ? 'Reset your Shepherd POS app password.' : 'Reset your Shepherd portal password.'}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Repeat your new password"
              className="w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-md bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}
