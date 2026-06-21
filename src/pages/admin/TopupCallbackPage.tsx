import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../../lib/api'

export default function TopupCallbackPage() {
  const [params] = useSearchParams()
  const reference = params.get('reference') ?? params.get('trxref') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading')
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    if (!reference) { setStatus('failed'); return }
    api.get(`/api/v1/sms/topup/verify/${reference}`)
      .then(r => {
        setStatus(r.data.data.status)
        setQuantity(r.data.data.quantity ?? 0)
      })
      .catch(() => setStatus('failed'))
  }, [reference])

  return (
    <div className="space-y-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold">
        {status === 'loading' ? 'Verifying payment…' :
          status === 'success' ? 'Payment successful!' :
          status === 'pending' ? 'Payment pending' :
          'Payment failed'}
      </h1>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">{quantity} SMS credits added to your account</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">The payment could not be completed. Please try again.</p>
        </div>
      )}

      {status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-700">Your payment is being processed. Credits will be added shortly.</p>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link to="/subscription" className="h-10 px-6 rounded-md border border-gray-300 text-sm font-medium inline-flex items-center hover:bg-gray-50">
          Back to subscription
        </Link>
        <Link to="/subscription/topup" className="h-10 px-6 rounded-md bg-blue-600 text-white text-sm font-medium inline-flex items-center hover:bg-blue-700">
          Buy more
        </Link>
      </div>
    </div>
  )
}
