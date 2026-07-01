import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, ArrowUpRight } from 'lucide-react'
import { subscriptionApi } from '../../lib/api'
import { UpgradeModal } from '../../components/UpgradeModal'

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

function StatusBadge({ status }: { status: string }) {
  const classes = {
    trial:           'bg-amber-100 text-amber-700',
    active:          'bg-green-100 text-green-700',
    pending_payment: 'bg-blue-100 text-blue-700',
    suspended:       'bg-red-100 text-red-700',
    expired:         'bg-muted text-muted-foreground',
  }[status] ?? 'bg-muted text-muted-foreground'

  const labels: Record<string, string> = {
    trial: 'Free trial', active: 'Active',
    pending_payment: 'Payment pending', suspended: 'Suspended',
  }

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {labels[status] ?? status.replace(/_/g, ' ')}
    </span>
  )
}

export default function SubscriptionPage() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const { data: sub } = useQuery<SubStatus>({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionApi.status(),
  })

  const isTrial    = sub?.status === 'trial'
  const isActive   = sub?.status === 'active'
  const isFree     = sub?.plan === 'free' || !sub?.plan
  const isPaid     = isActive && !isFree
  const isExpired  = sub?.expiresAt ? new Date(sub.expiresAt) < new Date() : false
  const daysLeft   = sub?.expiresAt
    ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null
  const trialLeft  = sub?.trialDaysRemaining ?? null

  const showUpgradePrompt = isTrial || isFree || isExpired || (isPaid && daysLeft !== null && daysLeft <= 7)

  if (!sub) return null

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-foreground">Subscription</h1>

      {/* Main status card */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        {/* Plan header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <p className="text-lg font-bold capitalize text-foreground">{sub.plan ?? 'Free'} plan</p>
              <StatusBadge status={sub.status} />
            </div>
            {isTrial && sub.trialEndsAt && (
              <p className="text-sm text-muted-foreground">
                Trial ends {fmt(sub.trialEndsAt)}
                {trialLeft !== null && ` · ${trialLeft} day${trialLeft !== 1 ? 's' : ''} left`}
              </p>
            )}
            {isPaid && sub.expiresAt && !isExpired && (
              <p className="text-sm text-muted-foreground">Renews {fmt(sub.expiresAt)} · {sub.billingCycle}</p>
            )}
            {isPaid && isExpired && (
              <p className="text-sm text-destructive">Expired {sub.expiresAt ? fmt(sub.expiresAt) : ''}</p>
            )}
          </div>

          {/* Upgrade button */}
          <button
            onClick={() => setShowUpgrade(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            {isFree || (isTrial && !isPaid) ? 'Upgrade' : isExpired ? 'Renew' : 'Change plan'}
          </button>
        </div>

        {/* Alerts */}
        {isTrial && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start justify-between gap-3">
            <p>
              <strong>14-day free trial</strong> — full Business features unlocked.
              After the trial you move to the Free plan automatically.
            </p>
            <button onClick={() => setShowUpgrade(true)} className="shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800">
              Lock in now
            </button>
          </div>
        )}
        {isExpired && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-3">
            Your subscription expired. Renew to restore all features.
            <button onClick={() => setShowUpgrade(true)} className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:opacity-80">Renew now</button>
          </div>
        )}
        {isPaid && !isExpired && daysLeft !== null && daysLeft <= 7 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-3">
            Your subscription expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
            <button onClick={() => setShowUpgrade(true)} className="shrink-0 text-xs font-semibold underline underline-offset-2">Renew</button>
          </div>
        )}

        {/* Limits grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Products',       sub.productLimit != null ? `Up to ${sub.productLimit.toLocaleString()}` : 'Unlimited'],
            ['Shops',          String(sub.shopLimit)],
            ['Staff',          sub.employeeLimit != null ? `Up to ${sub.employeeLimit}` : 'Unlimited'],
            ['Credit module',  sub.creditModuleEnabled ? 'Enabled' : 'Not included'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted/40 px-3.5 py-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
            </div>
          ))}

          {sub.smsAllocation > 0 && (
            <div className="rounded-lg bg-muted/40 px-3.5 py-3 col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-muted-foreground">SMS this cycle</p>
                <p className="text-xs font-semibold text-foreground">
                  {sub.smsUsedThisCycle.toLocaleString()} / {sub.smsAllocation.toLocaleString()} used
                </p>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    sub.smsUsedThisCycle / sub.smsAllocation > 0.8 ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, (sub.smsUsedThisCycle / sub.smsAllocation) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Upgrade nudge for free users */}
        {showUpgradePrompt && !isExpired && !isTrial && (
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-primary/30 bg-primary/5 text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
          >
            <span>Upgrade to unlock more shops, staff, and SMS</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
