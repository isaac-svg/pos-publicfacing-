import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { subscriptionApi } from '../../lib/api'

interface SubStatus {
  status: string; plan: string; billingCycle: string | null
  activatedAt: string | null; expiresAt: string | null
  trialStartedAt: string | null; trialEndsAt: string | null
  trialDaysRemaining: number | null
  productLimit: number | null; shopLimit: number; employeeLimit: number | null
  creditModuleEnabled: boolean; smsAllocation: number; smsUsedThisCycle: number
}

export default function SubscriptionPage() {
  const { data: sub } = useQuery<SubStatus>({ queryKey: ['subscription-status'], queryFn: () => subscriptionApi.status() })
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState('')

  const isTrial = sub?.status === 'trial'
  const isActive = sub?.status === 'active'
  const isExpired = sub?.expiresAt && new Date(sub.expiresAt) < new Date()
  const isFree = sub?.plan === 'free'
  const daysLeft = sub?.expiresAt ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86_400_000)) : null

  async function handleRenew() {
    if (!sub) return
    setUpgrading(true)
    setUpgradeError('')
    try {
      const data = await subscriptionApi.changePlan({ plan: sub.plan, billingCycle: sub.billingCycle ?? 'monthly' })
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to initiate payment'
      setUpgradeError(msg)
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Subscription</h1>

      {sub && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          {isTrial && sub.trialEndsAt && (
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm text-amber-800">
              Trial ends {new Date(sub.trialEndsAt).toLocaleDateString()}
              {sub.trialDaysRemaining != null && ` (${sub.trialDaysRemaining} day${sub.trialDaysRemaining !== 1 ? 's' : ''} left)`}
            </div>
          )}

          {isActive && !isFree && isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-800">
              Your subscription has expired. Renew to keep your features.
            </div>
          )}

          {isActive && !isFree && !isExpired && daysLeft != null && daysLeft <= 7 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-sm text-amber-800">
              Your subscription expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}.
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold capitalize">{sub.plan ?? 'No plan'}</h2>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-700' :
                isTrial ? 'bg-amber-100 text-amber-700' :
                sub.status === 'pending_payment' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {isTrial ? 'Trial' : sub.status?.replace(/_/g, ' ') ?? 'Unknown'}
              </span>
            </div>
            {sub.expiresAt && !isTrial && (
              <div className="text-right text-sm text-gray-500">
                <p>{isExpired ? 'Expired' : 'Renews'}: {new Date(sub.expiresAt).toLocaleDateString()}</p>
                <p className="capitalize">{sub.billingCycle ?? 'monthly'}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Products</p>
              <p className="font-semibold">{sub.productLimit != null ? `up to ${sub.productLimit.toLocaleString()}` : 'Unlimited'}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Shops</p>
              <p className="font-semibold">{sub.shopLimit ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Employees</p>
              <p className="font-semibold">{sub.employeeLimit ?? 'Unlimited'}</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-500">Credit module</p>
              <p className="font-semibold">{sub.creditModuleEnabled ? 'Enabled' : 'Not included'}</p>
            </div>
            {sub.smsAllocation > 0 && (
              <div className="bg-gray-50 rounded-md p-3 col-span-2">
                <p className="text-xs text-gray-500">SMS this cycle</p>
                <p className="font-semibold">{sub.smsUsedThisCycle.toLocaleString()} / {sub.smsAllocation.toLocaleString()}</p>
                <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (sub.smsUsedThisCycle / sub.smsAllocation) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {upgradeError && <p className="text-sm text-red-600">{upgradeError}</p>}

          <div className="flex gap-3 pt-2">
            {!isFree && (isActive || sub.status === 'pending_payment') && (
              <button
                onClick={handleRenew}
                disabled={upgrading}
                className="flex-1 h-10 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {upgrading ? 'Redirecting…' : isExpired ? 'Renew subscription' : 'Renew early'}
              </button>
            )}
            <Link
              to="/select-plan"
              className="flex-1 h-10 rounded-md border border-gray-300 text-sm font-medium text-center leading-10 hover:bg-gray-50"
            >
              {isFree || isTrial ? 'Upgrade plan' : 'Change plan'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
