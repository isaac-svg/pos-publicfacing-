import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../lib/api'

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => subscriptionApi.status(),
    staleTime: 60_000,
    retry: false,
  })
}
