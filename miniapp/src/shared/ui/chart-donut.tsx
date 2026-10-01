import { useMemo } from 'react'
import { Image } from '@tarojs/components'
import { chartPresentationColors } from '@ww-bill/bill-ui'
import { getCategoryDonutSlices } from '@ww-bill/bill-core'
import { useAppearanceTemplate } from '../model/appearance'

export function ChartDonut({ categories }: { categories: { amount: string | number }[] }) {
  const template = useAppearanceTemplate()
  const source = useMemo(() => {
    const palette = chartPresentationColors[template]
    const circumference = 2 * Math.PI * 54
    const rings = categories.length ? getCategoryDonutSlices(categories).map(slice => `<circle cx="64" cy="64" r="54" fill="none" stroke="${palette.series[slice.colorIndex]}" stroke-width="20" stroke-dasharray="${(slice.end - slice.start) * circumference} ${circumference}" stroke-dashoffset="${-slice.start * circumference}" transform="rotate(-90 64 64)"/>`).join('') : `<circle cx="64" cy="64" r="54" fill="none" stroke="${palette.border}" stroke-width="20"/>`
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${rings}</svg>`)}`
  }, [categories, template])
  return <Image svg className='bill-dashboard-donut__graph' mode='scaleToFill' src={source} aria-label='分类构成' />
}
