import { create } from 'zustand'
import type { AppearanceTemplate } from '@ww-bill/bill-core'

interface AppearanceState {
  userId: string
  template: AppearanceTemplate
  setPreference: (userId: string, template: AppearanceTemplate) => void
  reset: () => void
}

export const useAppearanceStore = create<AppearanceState>(set => ({
  userId: '',
  template: 'glass',
  setPreference: (userId, template) => set({ userId, template }),
  reset: () => set({ userId: '', template: 'glass' }),
}))

export function useAppearanceTemplate() {
  return useAppearanceStore(state => state.template)
}
