import { View } from '@tarojs/components'
import type { PropsWithChildren } from 'react'
import { useAppearanceTemplate } from '../model/appearance'

export function Page({ children, className = 'page' }: PropsWithChildren<{ className?: string }>) {
  const template = useAppearanceTemplate()
  return <View className={`${className} bill-theme--${template}`}>{children}</View>
}
