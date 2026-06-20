import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  business: { id: number; businessName: string } | null
  subscription: { status: string; plan: string | null } | null
  login: (token: string, business: AuthState['business'], subscription: AuthState['subscription']) => void
  logout: () => void
  updateSubscription: (sub: AuthState['subscription']) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      business: null,
      subscription: null,
      login: (token, business, subscription) => {
        localStorage.setItem('signup_token', token)
        set({ token, business, subscription })
      },
      logout: () => {
        localStorage.removeItem('signup_token')
        set({ token: null, business: null, subscription: null })
      },
      updateSubscription: (subscription) => set({ subscription }),
    }),
    { name: 'signup-auth' },
  ),
)
