import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Text, View } from '@tarojs/components'
import Taro, { useReady, useDidShow } from '@tarojs/taro'
import { fitMetricFontSize } from '@ww-bill/bill-core'
import { ChartSummaryMetrics, type MetricRowItem, type MetricRowPrimitives } from '@ww-bill/bill-ui'

const primitives: MetricRowPrimitives = { Root: View, Cell: View, Label: Text, Value: View, Text }

function widths(rectangles: unknown): number[] {
  if (!Array.isArray(rectangles))
    return []
  return rectangles.map((rectangle: unknown) => {
    if (rectangle && typeof rectangle === 'object' && 'width' in rectangle && typeof rectangle.width === 'number')
      return rectangle.width
    return 0
  })
}

export function ChartSummary({ items }: { items: readonly MetricRowItem[] }) {
  const id = `chart-summary-${useId().replace(/:/g, '')}`
  const [fontSize, setFontSize] = useState(28)
  const fontSizeRef = useRef(28)
  const requestVersion = useRef(0)
  const content = items.map(item => String(item.value)).join('|')

  const measure = useCallback(() => {
    const version = ++requestVersion.current
    Taro.nextTick(() => {
      if (version !== requestVersion.current)
        return
      const measuredSize = fontSizeRef.current
      const query = Taro.createSelectorQuery()
      query.selectAll(`#${id} .bill-chart-metrics__slot`).boundingClientRect()
      query.selectAll(`#${id} .bill-chart-metrics__text`).boundingClientRect()
      query.exec((results: unknown[]) => {
        if (version !== requestVersion.current)
          return
        const slots = widths(results[0])
        const textWidths = widths(results[1])
        if (!slots.length || slots.length !== textWidths.length)
          return
        const nextSize = fitMetricFontSize(textWidths.map((width, index) => ({ availableWidth: slots[index], naturalWidth: width * 28 / measuredSize })))
        fontSizeRef.current = nextSize
        setFontSize(nextSize)
      })
    })
  }, [id])

  useReady(measure)
  useDidShow(measure)
  useEffect(() => {
    const pending = requestVersion
    measure()
    return () => { pending.current++ }
  }, [content, measure])

  return <ChartSummaryMetrics id={id} items={items} primitives={primitives} valueFontSize={fontSize} />
}
