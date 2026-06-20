import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function PendingPage() {
  const navigate = useNavigate()
  const { subscription, updateSubscription } = useAuthStore()
  const [checking, setChecking] = useState(false)

  async function checkStatus() {
    setChecking(true)
    try {
      const res = await api.get('/api/v1/subscriptions/status')
      const status = res.data.data
      updateSubscription({ status: status.status, plan: status.plan })
      if (status.status === 'active') navigate('/dashboard')
    } catch { /* ignore */ }
    finally { setChecking(false) }
  }

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
          <p>To activate your account, please contact us to arrange payment:</p>
          <p className="font-medium">📞 +233 XX XXX XXXX</p>
          <p className="font-medium">✉️ support@shepherdpos.com</p>
          <p className="text-xs text-gray-400 mt-2">Once payment is confirmed, your account will be activated and you can download the POS desktop app.</p>
        </div>

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
