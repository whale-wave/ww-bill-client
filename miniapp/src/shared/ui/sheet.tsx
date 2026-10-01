import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { View } from '@tarojs/components'
import { useOverlayStore } from '../model/overlay'
import './sheet.scss'

/** Native layers and the external custom tab bar are controlled only here. */
export function Sheet({ children, visible, onClose, opaque = false, className = '' }: PropsWithChildren<{ visible: boolean, onClose: () => void, opaque?: boolean, className?: string }>) {
  useEffect(() => {
    if (!visible)
      return
    useOverlayStore.getState().acquire()
    return () => useOverlayStore.getState().release()
  }, [visible])
  if (!visible)
    return null
  return <View className='bill-native-sheet-overlay'>
    <View className='bill-native-sheet-mask' onClick={onClose} />
    <View className={`bill-native-sheet-body${opaque ? ' bill-native-sheet-body--opaque' : ''} ${className}`}>{children}</View>
  </View>
}
