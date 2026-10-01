import { useMemo } from 'react'
import { Image } from '@tarojs/components'
import { chartPresentationColors } from '@ww-bill/bill-ui'
import { buildTrendGeometry, withColorAlpha } from '@ww-bill/bill-core'
import { useAppearanceTemplate } from '../model/appearance'

export function ChartTrend({ timeline, metric = 'expense' }: { timeline: Array<{ key: string; expense: string; income?: string; net?: string }>; metric?: 'expense' | 'income' | 'net' }) {
  const template = useAppearanceTemplate()
  const source = useMemo(() => {
    const palette = chartPresentationColors[template]
    const color = palette.series[metric === 'income' ? 1 : metric === 'net' ? 2 : 0]
    const fill = withColorAlpha(palette.series[metric === 'income' ? 1 : 0], 0.14)
    const trend = buildTrendGeometry(timeline.map(day => Number(day[metric] ?? 0)))
    const lines = [trend.zeroY, 8, 92].map(y => `<line x1="0" x2="100" y1="${y}" y2="${y}" stroke="${palette.border}" stroke-dasharray="2 3" stroke-width="0.7"/>`).join('')
    const plot = trend.path ? `<path d="${trend.path} L 100 ${trend.zeroY} L 0 ${trend.zeroY} Z" fill="${fill}"/><path d="${trend.path}" fill="none" stroke="${color}" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>` : ''
    const markers = trend.points.map(point => `<ellipse cx="${point.x}" cy="${point.y}" rx="1.25" ry="3.57" fill="${color}" stroke="${palette.inverse}" stroke-width="0.3"/>`).join('')
    // Geometry is normalized; the platform owns SVG encoding and image output.
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}${plot}${markers}</svg>`)}`
  }, [timeline, metric, template])
  return <Image svg className='bill-chart-trend' mode='scaleToFill' src={source} aria-label='收支趋势' />
}
