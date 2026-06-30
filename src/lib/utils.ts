import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (err && typeof err === 'object') {
    if ('response' in err) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } }
      const msg = axiosErr.response?.data?.error?.message
      if (msg) return msg
    }
    if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
      return (err as { message: string }).message
    }
  }
  return fallback
}
