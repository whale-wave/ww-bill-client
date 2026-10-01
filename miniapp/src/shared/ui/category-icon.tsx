import { useState } from 'react'
import { Image, Text } from '@tarojs/components'
import { categoryIconTextStyle, categoryIconImageSource, resolveCategoryIcon, type CategoryIconInput, type IconTone } from '@ww-bill/bill-ui'
import { useAppearanceTemplate } from '../model/appearance'
import { resolvePublicMediaUrl } from '../lib/public-media-url'

export function CategoryIcon({ size = 18, color, tone = 'category', ...input }: Omit<CategoryIconInput, 'imageFailed'> & { size?: number; color?: string; tone?: IconTone }) {
  const template = useAppearanceTemplate()
  const [failedImage, setFailedImage] = useState<string>()
  const visual = resolveCategoryIcon({ ...input, imageFailed: Boolean(input.iconKey && failedImage === input.iconKey) })
  if (visual.kind === 'text' || visual.kind === 'emoji') {
    return <Text style={{ ...categoryIconTextStyle(visual.kind, size), color: color ?? (tone === 'ink' ? 'var(--ww-theme-text-color)' : undefined) }}>{visual.value}</Text>
  }
  if (visual.kind === 'image') {
    return <Image mode='aspectFill' src={resolvePublicMediaUrl(visual.value) ?? visual.value} onError={() => setFailedImage(input.iconKey)} style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'block' }} />
  }
  return <Image mode='aspectFit' svg src={categoryIconImageSource(visual.glyph, { color, tone, appearance: template })} style={{ width: `${size}px`, height: `${size}px`, display: 'block' }} />
}
