import type { SurfacePresentationProps } from '@ww-bill/bill-ui'
import { View } from '@tarojs/components'
import { SurfacePresentation } from '@ww-bill/bill-ui'

export function Surface(props: Omit<SurfacePresentationProps, 'primitive' | 'rootRef'>) {
  return <SurfacePresentation {...props} primitive={View} />
}
