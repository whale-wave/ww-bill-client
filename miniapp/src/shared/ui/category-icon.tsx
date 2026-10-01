import { useState } from 'react'
import { Image, Text } from '@tarojs/components'
import { categoryIconTextStyle, categoryIconImageSource, resolveCategoryIcon, type CategoryIconInput } from '@ww-bill/bill-ui'

export function CategoryIcon({ size = 18, color, ...input }: Omit<CategoryIconInput, 'imageFailed'> & { size?: number; color?: string }) {
  const [failedImage, setFailedImage] = useState<string>()
  const visual = resolveCategoryIcon({ ...input, imageFailed: Boolean(input.iconKey && failedImage === input.iconKey) })
  if (visual.kind === 'text' || visual.kind === 'emoji') {
    return <Text style={{ ...categoryIconTextStyle(visual.kind, size), color }}>{visual.value}</Text>
  }
  if (visual.kind === 'image') {
    return <Image mode='aspectFill' src={visual.value} onError={() => setFailedImage(input.iconKey)} style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'block' }} />
  }
  return <Image mode='aspectFit' svg src={categoryIconImageSource(visual.glyph, { color })} style={{ width: `${size}px`, height: `${size}px`, display: 'block' }} />
}
