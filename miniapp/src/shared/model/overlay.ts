import { create } from 'zustand'

/** Native custom tab bars live outside page layers; hosts release on unmount. */
export const useOverlayStore = create<{ count: number, acquire: () => void, release: () => void }>(set => ({
  count: 0,
  acquire: () => set(state => ({ count: state.count + 1 })),
  release: () => set(state => ({ count: Math.max(0, state.count - 1) })),
}))
