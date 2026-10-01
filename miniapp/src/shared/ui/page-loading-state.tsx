import { Image, Text, View } from '@tarojs/components'
import { PageLoadingVisual } from '@ww-bill/bill-ui'
import whaleLoading from '@ww-bill/bill-ui/whale-loading.png'

export function PageLoadingState({ label, compact = false }: { label: string, compact?: boolean }) {
  return <PageLoadingVisual label={label} compact={compact} primitives={{ Box: View, Text }} image={<Image className='bill-page-loading__image' mode='aspectFit' src={whaleLoading} />} />
}
