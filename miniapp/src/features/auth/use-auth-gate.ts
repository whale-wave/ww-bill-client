import Taro, { useDidShow } from '@tarojs/taro'
import { useAuthStore } from './store'

export function useAuthGate() {
  const token = useAuthStore(state => state.token)
  useDidShow(() => {
    if (!useAuthStore.getState().token)
      void Taro.reLaunch({ url: '/pages/login/index' })
  })
  return Boolean(token)
}
