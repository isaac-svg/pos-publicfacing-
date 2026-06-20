import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../../lib/api'

export default function SubscriptionPage() {
  const { data: sub } = useQuery({ queryKey: ['subscription-status'], queryFn: () => subscriptionApi.status() })

  const s = sub as { status?: string; plan?: string; billingCycle?: string; activatedAt?: string; expiresAt?: string; productLimit?: number; shopLimit?: number; employeeLimit?: number | null; creditModuleEnabled?: boolean } | undefined

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Subscription</h1>

      {s && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold capitalize">{s.plan ?? 'No plan'}</h2>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {s.status?.replace(/_/g, ' ') ?? 'Unknown'}
              </span>
            </div>
            {s.expiresAt && (
              <div className="text-right text-sm text-gray-500">
                <p>Renews: {new Date(s.expiresAt).toLocaleDateString()}</p>
                <p className="capitalize">{s.billingCycle}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Products</p>
              <p className="font-semibold">up to {s.productLimit?.toLocaleString() ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Shops</p>
              <p className="font-semibold">{s.shopLimit ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Employees</p>
              <p className="font-semibold">{s.employeeLimit ?? 'Unlimited'}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Credit module</p>
              <p className="font-semibold">{s.creditModuleEnabled ? 'Enabled ✓' : 'Not included'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
