import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

interface AuthState {
  token: string
  userId: string
  sessionVersion: number
  startSession: (token: string, userId: string) => void
  logOut: () => void
}

const taroStorage: StateStorage = {
  getItem: key => Taro.getStorageSync<string>(key) || null,
  setItem: (key, value) => Taro.setStorageSync(key, value),
  removeItem: key => Taro.removeStorageSync(key),
}

export const useAuthStore = create<AuthState>()(persist(set => ({
  token: '',
  userId: '',
  sessionVersion: 0,
  startSession: (token, userId) => set(state => ({ token, userId, sessionVersion: state.sessionVersion + 1 })),
  logOut: () => set(state => ({ token: '', userId: '', sessionVersion: state.sessionVersion + 1 })),
}), {
  name: 'ww-bill-miniapp-auth',
  storage: createJSONStorage(() => taroStorage),
  partialize: state => ({ token: state.token, userId: state.userId }),
}))
