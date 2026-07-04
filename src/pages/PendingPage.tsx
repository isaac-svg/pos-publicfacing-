import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE ?? '+233 XX XXX XXXX'
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@kixon.net'

export default function PendingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const reference = params.get('reference')
  const { subscription, updateSubscription } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'idle'>('idle')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reference) return
    setStatus('loading')
    api.get(`/api/v1/subscriptions/verify-payment/${reference}`)
      .then(res => {
        const s = res.data.data.status
        if (s === 'success') {
          updateSubscription({ status: 'active', plan: res.data.data.plan })
          setStatus('success')
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [reference, updateSubscription])

  async function checkStatus() {
    setChecking(true); setError('')
    try {
      const res = await api.get('/api/v1/subscriptions/status')
      const data = res.data.data
      updateSubscription({ status: data.status, plan: data.plan })
      if (data.status === 'active' || data.status === 'trial') navigate('/dashboard')
      else setError('Payment not confirmed yet. Try again in a moment.')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to check status')
    } finally {
      setChecking(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your payment…</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center text-2xl">✅</div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Payment successful!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your <strong className="capitalize">{subscription?.plan ?? ''}</strong> plan is now active.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-2xl">❌</div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Payment failed</h1>
            <p className="text-sm text-muted-foreground mt-1">The payment could not be completed.</p>
          </div>
          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm text-left space-y-1">
            <p className="font-medium text-foreground">Contact us to sort this out</p>
            <p className="text-muted-foreground">📞 {SUPPORT_PHONE}</p>
            <p className="text-muted-foreground">✉️ {SUPPORT_EMAIL}</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            onClick={checkStatus}
            disabled={checking}
            className="w-full h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted/40 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checking && <Loader2 className="w-4 h-4 animate-spin" />}
            {checking ? 'Checking…' : 'Check payment status'}
          </button>
        </div>
      </div>
    )
  }

  // Idle: user navigated directly to /pending (e.g. pending_payment status on login)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl">⏳</div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Payment pending</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {subscription?.plan
              ? <>Your <strong className="capitalize">{subscription.plan}</strong> plan is awaiting payment confirmation.</>
              : 'Your account is awaiting payment confirmation.'}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm text-left space-y-1">
          <p className="font-medium text-foreground">Contact us to complete setup</p>
          <p className="text-muted-foreground">📞 {SUPPORT_PHONE}</p>
          <p className="text-muted-foreground">✉️ {SUPPORT_EMAIL}</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          onClick={checkStatus}
          disabled={checking}
          className="w-full h-10 rounded-lg border border-border text-sm font-medium hover:bg-muted/40 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {checking && <Loader2 className="w-4 h-4 animate-spin" />}
          {checking ? 'Checking…' : 'Check payment status'}
        </button>
      </div>
    </div>
  )
}
