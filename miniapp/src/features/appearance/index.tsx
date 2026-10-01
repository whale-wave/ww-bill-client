import { useLayoutEffect, useEffect, type PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { resolveAppearanceTemplate, type AppearanceTemplate } from '@ww-bill/bill-core'
import { useAuthStore } from '../auth'
import { useAppearanceStore } from '../../shared/model/appearance'
import { useUserAppConfig } from '../../entities/user-app-config'

const mirrorKey = (userId: string) => `ww-bill-miniapp-appearance:${userId}`

/** Platform cache and requests stay here; the server remains the preference authority. */
export function AppearanceProvider({ children }: PropsWithChildren) {
  const token = useAuthStore(state => state.token)
  const userId = useAuthStore(state => state.userId)
  const config = useUserAppConfig({ userId, enabled: Boolean(token && userId) })

  useLayoutEffect(() => {
    let template: AppearanceTemplate = 'glass'
    if (token && userId) {
      try { template = resolveAppearanceTemplate(Taro.getStorageSync(mirrorKey(userId))) }
      catch { /* A missing local mirror never blocks the account page. */ }
    }
    useAppearanceStore.getState().setPreference(token ? userId : '', template)
  }, [token, userId])

  useEffect(() => {
    if (!token || !userId || !config.data || String(config.data.userId) !== userId)
      return
    const template = resolveAppearanceTemplate(config.data.appearanceTemplate)
    useAppearanceStore.getState().setPreference(userId, template)
    try { Taro.setStorageSync(mirrorKey(userId), template) }
    catch { /* Display the authoritative value even when persistence is unavailable. */ }
  }, [token, userId, config.data])

  return <>{children}</>
}
