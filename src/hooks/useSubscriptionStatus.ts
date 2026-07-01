import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { subscriptionApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

export function useSubscriptionStatus(options?: { enabled?: boolean }) {
  const token = useAuthStore(s => s.token)
  const updateSubscription = useAuthStore(s => s.updateSubscription)

  const query = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionApi.status(),
    staleTime: 30_000,   // refresh every 30s so superadmin changes propagate quickly
    retry: false,
    enabled: !!token && (options?.enabled ?? true),
  })

  // Keep the auth store in sync with the latest API data so plan gating
  // reflects superadmin changes without requiring a re-login.
  useEffect(() => {
    if (query.data) {
      const d = query.data as { status: string; plan: string | null }
      updateSubscription({ status: d.status, plan: d.plan })
    }
  }, [query.data, updateSubscription])

  return query
}
