import { Image, Text, View } from '@tarojs/components'
import { PageLoadingVisual } from '@ww-bill/bill-ui'
import { whaleLoading } from '../lib/presentation-assets'

export function PageLoadingState({ label, compact = false, className }: { label: string, compact?: boolean, className?: string }) {
  return <PageLoadingVisual label={label} compact={compact} className={className} primitives={{ Box: View, Text }} image={<Image className='bill-page-loading__image' mode='aspectFit' src={whaleLoading} />} />
}
