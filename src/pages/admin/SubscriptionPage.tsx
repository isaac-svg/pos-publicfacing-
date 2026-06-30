import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../../lib/api'

interface SubStatus {
  status: string; plan: string; billingCycle: string | null
  activatedAt: string | null; expiresAt: string | null
  trialStartedAt: string | null; trialEndsAt: string | null
  trialDaysRemaining: number | null
  productLimit: number | null; shopLimit: number; employeeLimit: number | null
  creditModuleEnabled: boolean; smsAllocation: number; smsUsedThisCycle: number
}

function fmt(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SubscriptionPage() {
  const { data: sub } = useQuery<SubStatus>({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionApi.status(),
  })

  const isTrial = sub?.status === 'trial'
  const isActive = sub?.status === 'active'
  const isFree = sub?.plan === 'free' || !sub?.plan
  const expired = sub?.expiresAt ? new Date(sub.expiresAt) < new Date() : false
  const daysLeft = sub?.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null
  const trialDaysLeft = sub?.trialDaysRemaining ?? null

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-xl font-bold text-foreground">Subscription</h1>

      {sub && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          {/* Status banners */}
          {isTrial && trialDaysLeft !== null && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              🎁 You are on a <strong>14-day free trial</strong> (Growth plan).{' '}
              {trialDaysLeft > 0
                ? <><strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong> remaining.</>
                : 'Trial ends today.'
              }{' '}
              After the trial you move to the Free plan automatically.
            </div>
          )}

          {isActive && !isFree && expired && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              Your subscription has expired. Contact us to renew.
            </div>
          )}

          {isActive && !isFree && !expired && daysLeft !== null && daysLeft <= 7 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Your subscription expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>. Contact us to renew.
            </div>
          )}

          {/* Plan name + status */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold capitalize text-foreground">{sub.plan ?? 'Free'}</h2>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isTrial ? 'bg-amber-100 text-amber-700' :
                isActive ? 'bg-accent text-accent-foreground' :
                sub.status === 'pending_payment' ? 'bg-blue-100 text-blue-700' :
                'bg-muted text-muted-foreground'
              }`}>
                {isTrial ? `Trial` : sub.status?.replace(/_/g, ' ') ?? 'Unknown'}
              </span>
            </div>

            {sub.expiresAt && !isTrial && (
              <div className="text-right text-sm text-muted-foreground">
                <p>{expired ? 'Expired' : 'Renews'} {fmt(sub.expiresAt)}</p>
                <p className="capitalize">{sub.billingCycle ?? 'monthly'}</p>
              </div>
            )}

            {isTrial && sub.trialEndsAt && (
              <div className="text-right text-sm text-muted-foreground">
                <p>Trial ends {fmt(sub.trialEndsAt)}</p>
              </div>
            )}
          </div>

          {/* Limits grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Products</p>
              <p className="font-semibold text-foreground">
                {sub.productLimit != null ? `up to ${sub.productLimit.toLocaleString()}` : 'Unlimited'}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Shops</p>
              <p className="font-semibold text-foreground">{sub.shopLimit ?? '—'}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Employees</p>
              <p className="font-semibold text-foreground">{sub.employeeLimit ?? 'Unlimited'}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Credit module</p>
              <p className="font-semibold text-foreground">{sub.creditModuleEnabled ? 'Enabled' : 'Not included'}</p>
            </div>

            {sub.smsAllocation > 0 && (
              <div className="bg-muted/40 rounded-lg p-3 col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-muted-foreground">SMS this cycle</p>
                  <p className="text-xs font-medium text-foreground">
                    {sub.smsUsedThisCycle.toLocaleString()} / {sub.smsAllocation.toLocaleString()}
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (sub.smsUsedThisCycle / sub.smsAllocation) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upgrade notice */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <p>
              {isFree && !isTrial
                ? 'You are on the Free plan. '
                : expired
                ? 'Your subscription has expired. '
                : ''}
              To upgrade or renew your subscription, please{' '}
              <a href="#contact" className="text-primary font-medium hover:underline">contact our team</a>
              {' '}and we'll activate your plan.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
