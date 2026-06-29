import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function PendingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const reference = params.get('reference')
  const { subscription, updateSubscription } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending' | 'idle'>('idle')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reference) return
    setStatus('loading')
    api.get(`/api/v1/subscriptions/verify-payment/${reference}`)
      .then(res => {
        const s = res.data.data.status
        setStatus(s === 'success' ? 'success' : 'failed')
        if (s === 'success') {
          updateSubscription({ status: 'active', plan: res.data.data.plan })
        }
      })
      .catch(() => setStatus('failed'))
  }, [reference, updateSubscription])

  async function checkStatus() {
    setChecking(true)
    setError('')
    try {
      const res = await api.get('/api/v1/subscriptions/status')
      const data = res.data.data
      updateSubscription({ status: data.status, plan: data.plan })
      if (data.status === 'active' || data.status === 'trial') navigate('/dashboard')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to check status')
    } finally {
      setChecking(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Verifying your payment…</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Payment successful!</h1>
            <p className="text-sm text-gray-500 mt-2">
              Your <strong className="capitalize">{subscription?.plan ?? 'selected'}</strong> plan is now active.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full h-10 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Payment failed</h1>
            <p className="text-sm text-gray-500 mt-2">
              The payment could not be completed. Please try again or contact support.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/select-plan"
              className="flex-1 h-10 rounded-md border border-gray-300 text-sm font-medium inline-flex items-center justify-center hover:bg-gray-50"
            >
              Try again
            </Link>
            <button
              onClick={checkStatus}
              disabled={checking}
              className="flex-1 h-10 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Check status'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default: no reference (user navigated here directly)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
          <span className="text-3xl">⏳</span>
        </div>

        <div>
          <h1 className="text-xl font-bold">Your account is almost ready</h1>
          <p className="text-sm text-gray-500 mt-2">
            You selected the <strong className="capitalize">{subscription?.plan ?? 'selected'}</strong> plan.
          </p>
        </div>

        <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-600 space-y-2 text-left">
          <p>To activate your account, please complete payment:</p>
          {(subscription?.plan && subscription.plan !== 'free') ? (
            <Link
              to="/select-plan"
              className="block w-full h-10 rounded-md bg-blue-600 text-white text-sm font-medium text-center leading-10 hover:bg-blue-700"
            >
              Go to payment
            </Link>
          ) : (
            <>
              <p className="font-medium">📞 +233 XX XXX XXXX</p>
              <p className="font-medium">✉️ support@shepherdpos.com</p>
              <p className="text-xs text-gray-400 mt-2">Once payment is confirmed, your account will be activated and you can download the POS desktop app.</p>
            </>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={checkStatus}
          disabled={checking}
          className="w-full h-10 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          {checking ? 'Checking…' : 'Check status'}
        </button>
      </div>
    </div>
  )
}
