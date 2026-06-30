import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export default function TopupSmsPage() {
  const [quantity, setQuantity] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: balance } = useQuery({
    queryKey: ['sms-balance'],
    queryFn: () => api.get('/api/v1/sms/balance').then(r => r.data.data),
  })

  const b = balance as { planAllocation?: number; usedThisCycle?: number; remainingAllocation?: number; toppedUpCredits?: number; totalBalance?: number; pricePerUnit?: number } | undefined
  const pricePerUnit = b?.pricePerUnit ?? 0.09
  const calculatedPrice = quantity * pricePerUnit

  async function handlePurchase() {
    setLoading(true); setError('')
    try {
      const res = await api.post('/api/v1/sms/topup/initiate', { quantity })
      window.location.href = res.data.data.authorizationUrl
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to initiate purchase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Buy SMS Credits</h1>

      {b && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan allocation</span>
            <span className="font-medium">{b.remainingAllocation ?? 0} remaining of {b.planAllocation ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Topped-up credits</span>
            <span className="font-medium">{b.toppedUpCredits ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-2">
            <span>Total balance</span>
            <span>{b.totalBalance ?? 0} SMS</span>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">How many SMS would you like?</label>
          <input
            type="number" min={50} step={50}
            value={quantity}
            onChange={e => setQuantity(Math.max(50, parseInt(e.target.value) || 50))}
            className="w-full h-10 rounded-md border border-border px-3 text-lg font-mono"
          />
          <p className="text-xs text-muted-foreground">Minimum 50 SMS</p>
        </div>

        <div className="bg-background rounded-md p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per SMS</span>
            <span>GH₵{pricePerUnit.toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>GH₵{calculatedPrice.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={handlePurchase}
          disabled={loading || quantity < 50}
          className="w-full h-10 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing…' : 'Pay with Paystack'}
        </button>
      </div>
    </div>
  )
}
