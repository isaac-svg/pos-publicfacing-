import { useEffect } from 'react'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useActivationGate } from '../store/activationGate'

export function RequireActiveSubscription({ children }: { children: React.ReactNode }) {
  const { data: sub, isLoading } = useSubscriptionStatus()
  const { open } = useActivationGate()

  useEffect(() => {
    if (!isLoading && sub?.status !== 'active' && sub?.status !== 'trial') {
      open()
    }
  }, [isLoading, sub?.status, open])

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>
  }

  if (sub?.status !== 'active' && sub?.status !== 'trial') {
    return <div className="h-screen" />
  }

  return <>{children}</>
}
