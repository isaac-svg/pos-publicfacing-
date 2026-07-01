import { useState } from 'react'
import { useActivationGate } from '../store/activationGate'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useAuthStore } from '../store/auth'
import { UpgradeModal } from './UpgradeModal'
import { Zap } from 'lucide-react'

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE ?? '+233 XX XXX XXXX'
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@shepherdpos.com'

export function ActivationGateModal() {
  const { isOpen, close } = useActivationGate()
  const token = useAuthStore(s => s.token)
  const { data: sub } = useSubscriptionStatus({ enabled: !!token })
  const [showPlans, setShowPlans] = useState(false)

  if (!isOpen) return null
  if (sub?.status === 'trial' || sub?.status === 'active') return null

  const isSuspended     = sub?.status === 'suspended'
  const isPendingPayment = sub?.status === 'pending_payment'
  const isExpired       = sub?.status === 'expired'

  if (showPlans) {
    return <UpgradeModal onClose={() => setShowPlans(false)} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 border border-border">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            {isSuspended      ? 'Account suspended'     :
             isPendingPayment  ? 'Payment pending'       :
             isExpired         ? 'Subscription expired'  :
             'Start your subscription'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSuspended
              ? 'Your account has been suspended. Please contact us to resolve this.'
              : isPendingPayment
              ? `Your ${sub?.plan ?? ''} plan payment is pending. Complete payment to unlock everything.`
              : 'Your trial or subscription has ended. Choose a plan to keep running your business.'}
          </p>
        </div>

        {/* CTA — show plan selector unless suspended */}
        {!isSuspended && (
          <button
            onClick={() => setShowPlans(true)}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isPendingPayment ? 'Complete payment' : 'View plans and pricing'}
          </button>
        )}

        {/* Support fallback */}
        <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm space-y-1">
          <p className="font-medium text-foreground text-xs uppercase tracking-wide text-muted-foreground">Need help?</p>
          <p className="text-muted-foreground">📞 {SUPPORT_PHONE}</p>
          <p className="text-muted-foreground">✉️ {SUPPORT_EMAIL}</p>
        </div>

        <button
          onClick={close}
          className="w-full h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
