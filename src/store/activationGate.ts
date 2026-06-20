import { create } from 'zustand'

interface ActivationGateState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useActivationGate = create<ActivationGateState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
