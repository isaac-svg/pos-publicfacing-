// Feature gating is handled by the sidebar (AdminLayout) and FeatureGateModal.
// This component no longer blocks page rendering — it only opens the gate for
// suspended or explicitly blocked accounts.
import { useEffect } from 'react'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useActivationGate } from '../store/activationGate'

export function RequireActiveSubscription({ children }: { children: React.ReactNode }) {
  const { data: sub, isLoading } = useSubscriptionStatus()
  const { open } = useActivationGate()

  useEffect(() => {
    if (!isLoading && (sub?.status === 'suspended')) {
      open()
    }
  }, [isLoading, sub?.status, open])

  // Always render children — feature access is controlled by FeatureGateModal in the sidebar
  return <>{children}</>
}
