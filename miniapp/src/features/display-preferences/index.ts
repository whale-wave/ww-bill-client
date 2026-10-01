import { useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { isAmountVisible } from '@ww-bill/bill-core'
import { useUserAppConfig } from '../../entities/user-app-config'

/** Native persistence and state are separate from the Web preference adapter. */
export function useAmountVisibility({ userId, enabled }: { userId: string, enabled: boolean }) {
  const config = useUserAppConfig({ userId, enabled: Boolean(userId && enabled) })
  const key = `ww-bill-miniapp-amount-visible:${userId}`
  const mirror = useMemo(() => {
    try {
      const value: unknown = Taro.getStorageSync(key)
      return typeof value === 'boolean' ? value : undefined
    }
    catch { return undefined }
  }, [key])
  const [override, setOverride] = useState<{ userId: string, value: boolean }>()
  const ownConfig = String(config.data?.userId) === userId ? config.data : undefined
  const visible = override?.userId === userId ? override.value : mirror ?? ownConfig?.isDisplayAmount ?? false
  const switchVisible = ownConfig?.isDisplayAmountSwitch ?? false
  function handleToggle() {
    const next = !visible
    setOverride({ userId, value: next })
    try { Taro.setStorageSync(key, next) }
    catch { /* Keep this account's current session usable without persistence. */ }
  }
  return { visible, switchVisible, isVisible: isAmountVisible({ isDisplayAmount: visible, isDisplayAmountSwitch: switchVisible }), handleToggle }
}
