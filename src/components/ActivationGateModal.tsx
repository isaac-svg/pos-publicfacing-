import { useActivationGate } from '../store/activationGate'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useAuthStore } from '../store/auth'

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE ?? '+233 XX XXX XXXX'
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@shepherdpos.com'

export function ActivationGateModal() {
  const { isOpen, close } = useActivationGate()
  const token = useAuthStore(s => s.token)
  const { data: sub } = useSubscriptionStatus({ enabled: !!token })

  if (!isOpen) return null
  if (sub?.status === 'trial' || sub?.status === 'active') return null

  const isSuspended = sub?.status === 'suspended'
  const isPendingPayment = sub?.status === 'pending_payment'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 border border-border">
        <h2 className="text-base font-semibold text-foreground">
          {isSuspended ? 'Account suspended' :
           isPendingPayment ? 'Payment pending' :
           'Subscription required'}
        </h2>

        <p className="text-sm text-muted-foreground">
          {isSuspended
            ? 'Your account has been suspended. Please contact us to resolve this.'
            : isPendingPayment
            ? `Your ${sub?.plan ?? 'selected'} plan payment is pending. Contact us to confirm your payment.`
            : 'Your trial or subscription has ended. Contact us to activate your plan.'}
        </p>

        <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm space-y-1">
          <p className="font-medium text-foreground">Get in touch</p>
          <p className="text-muted-foreground">📞 {SUPPORT_PHONE}</p>
          <p className="text-muted-foreground">✉️ {SUPPORT_EMAIL}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Once your plan is activated, every section unlocks immediately.
        </p>

        <button
          onClick={close}
          className="w-full h-10 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
