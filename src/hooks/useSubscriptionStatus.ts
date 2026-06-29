import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../lib/api'

export function useSubscriptionStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionApi.status(),
    staleTime: 60_000,
    retry: false,
    enabled: options?.enabled ?? true,
  })
}
