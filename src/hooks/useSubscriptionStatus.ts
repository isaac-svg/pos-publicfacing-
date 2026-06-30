import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

export function useSubscriptionStatus(options?: { enabled?: boolean }) {
  const token = useAuthStore(s => s.token)
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionApi.status(),
    staleTime: 60_000,
    retry: false,
    enabled: !!token && (options?.enabled ?? true),
  })
}
