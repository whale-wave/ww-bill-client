import { Image } from '@tarojs/components'
import { designIconImageSource, type DesignIconName, type IconAppearance, type IconTone } from '@ww-bill/bill-ui'
import { useAppearanceTemplate } from '../model/appearance'

export function DesignIcon({ name, size = 19, tone = 'inactive', appearance }: { name: DesignIconName, size?: number, tone?: IconTone, appearance?: IconAppearance }) {
  const template = useAppearanceTemplate()
  return <Image mode='aspectFit' svg src={designIconImageSource(name, { appearance: appearance ?? template, tone })} style={{ width: `${size}px`, height: `${size}px`, display: 'block' }} />
}
