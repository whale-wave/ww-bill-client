import { useMemo } from 'react'
import { Image, Text } from '@tarojs/components'
import { init, setPlatformAPI, use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { chartPresentationColors, lineChartOptions } from '@ww-bill/bill-ui'
import { withColorAlpha } from '@ww-bill/bill-core'
import { useAppearanceTemplate } from '../model/appearance'

use([LineChart, GridComponent, SVGRenderer])
// This compact chart hides all labels. Taro's document shim has no canvas
// context; the renderer must not try to measure hidden axis text through it.
setPlatformAPI({ measureText: () => ({ width: 0 }) })

export function ChartTrend({ timeline }: { timeline: Array<{ key: string, expense: string }> }) {
  const template = useAppearanceTemplate()
  const source = useMemo(() => {
    const palette = chartPresentationColors[template]
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 315, height: 80 })
    try {
      chart.setOption({
        ...lineChartOptions({ data: timeline.map(day => ({ value: Number(day.expense) })), labels: timeline.map(day => day.key), colors: { accent: palette.accent, inverse: palette.inverse, grid: withColorAlpha(palette.accent, 0.13), fillStart: withColorAlpha(palette.accent, 0.35), fillEnd: withColorAlpha(palette.accent, 0.02) } }),
        animation: false,
      })
      return { source: `data:image/svg+xml,${encodeURIComponent(chart.renderToSVGString())}`, error: '' }
    } catch (error) {
      console.error('Chart SVG rendering failed', error)
      return { source: '', error: error instanceof Error ? error.message : '未知错误' }
    } finally {
      chart.dispose()
    }
  }, [timeline, template])
  if (!source.source)
    return <Text className='muted'>趋势图暂时无法显示</Text>
  return <Image svg className='bill-chart-trend' mode='scaleToFill' src={source.source} aria-label='本月每日支出趋势' />
}
