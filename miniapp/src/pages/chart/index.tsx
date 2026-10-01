import { useState } from 'react'
import { Text, View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { money } from '@ww-bill/bill-core'
import { useMonthChart } from '../../entities/chart'
import { useAuthGate } from '../../features/auth'
import { currentMonth, shiftMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import { ChartSummary } from '../../shared/ui/chart-summary'
import './index.scss'


export default function ChartPage() {
  const [month, setMonth] = useState(currentMonth)
  const isAuthenticated = useAuthGate()
  const chartQuery = useMonthChart({ params: { month }, queryOptions: { enabled: isAuthenticated } })
  const summary = chartQuery.data?.summary
  const categories = chartQuery.data?.categories ?? []
  const largestAmount = Math.max(0, ...categories.map(category => Number(category.amount)))

  useDidShow(() => {
    if (isAuthenticated)
      void chartQuery.refetch()
  })

  function handlePreviousMonth() { setMonth(value => shiftMonth(value, -1)) }
  function handleNextMonth() {
    if (month < currentMonth())
      setMonth(value => shiftMonth(value, 1))
  }

  return (
    <View className='page'>
      <Text className='page__title'>图表</Text>
      <View className='row chart-month'>
        <Text onClick={handlePreviousMonth}>‹</Text><Text>{month.replace('-', '年')}月</Text><Text onClick={handleNextMonth}>›</Text>
      </View>
      {chartQuery.isLoading && <View className='state-panel'>正在加载图表…</View>}
      {chartQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(chartQuery.error)}</Text><AppButton variant='secondary' onClick={() => void chartQuery.refetch()}>重试</AppButton></View>}
      {summary && <>
        <Surface className='card chart-summary' material='raised'>
          <Text className='muted'>本月结余</Text>
          <Text className='money chart-summary__net'>¥{money.format(summary.net)}</Text>
          <ChartSummary items={[
            { key: 'income', label: '收入', tone: 'income', suffix: '¥', value: money.format(summary.income) },
            { key: 'expense', label: '支出', tone: 'expense', suffix: '¥', value: money.format(summary.expense) },
          ]}
          />
        </Surface>
        <Text className='section-title'>支出分类</Text>
        {categories.length === 0 && <View className='state-panel'>本月暂无支出数据</View>}
        <Surface className='card'>
          {categories.map(category => (
            <View key={category.key ?? category.id ?? category.name} className='chart-category'>
              <View className='row'><Text>{category.name}</Text><Text className='money'>¥{money.format(category.amount)}</Text></View>
              <View className='chart-category__track'><View className='chart-category__fill' style={{ width: `${largestAmount > 0 ? Math.max(3, Math.min(100, Number(category.amount) / largestAmount * 100)) : 0}%` }} /></View>
            </View>
          ))}
        </Surface>
      </>}
    </View>
  )
}
