import { useState, useEffect, type PropsWithChildren } from 'react'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query'
import { configureRequestContext } from './shared/api'
import { useAuthStore } from './features/auth/store'

import './app.scss'

configureRequestContext({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: requestToken => {
    const state = useAuthStore.getState()
    if (state.token !== requestToken)
      return
    state.logOut()
    void Taro.reLaunch({ url: '/pages/login/index' })
  },
})

function SessionQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30000, cacheTime: 300000, retry: 1 },
    },
  }))

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function App({ children }: PropsWithChildren) {
  const sessionVersion = useAuthStore(state => state.sessionVersion)

  useDidShow(() => focusManager.setFocused(true))
  useDidHide(() => focusManager.setFocused(false))

  useEffect(() => {
    void Taro.getNetworkType().then(result => onlineManager.setOnline(result.networkType !== 'none'))
    const handleNetworkChange = (result: { isConnected: boolean }) => onlineManager.setOnline(result.isConnected)
    Taro.onNetworkStatusChange(handleNetworkChange)
    return () => Taro.offNetworkStatusChange(handleNetworkChange)
  }, [])

  return <SessionQueryProvider key={sessionVersion}>{children}</SessionQueryProvider>
}
export default App
