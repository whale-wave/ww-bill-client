import { Image } from '@tarojs/components'
import { designIconImageSource, type DesignIconName, type IconAppearance, type IconTone } from '@ww-bill/bill-ui'

export function DesignIcon({ name, size = 19, tone = 'inactive', appearance = 'glass' }: { name: DesignIconName, size?: number, tone?: IconTone, appearance?: IconAppearance }) {
  return <Image mode='aspectFit' svg src={designIconImageSource(name, { appearance, tone })} style={{ width: `${size}px`, height: `${size}px`, display: 'block' }} />
}
