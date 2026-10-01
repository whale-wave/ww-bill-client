import { PageHeadingVisual , PeriodLabel, ProgressVisual, RankingRowVisual } from '@ww-bill/bill-ui'
import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { clampProgress, money } from '@ww-bill/bill-core'
import { useMonthChart } from '../../entities/chart'
import { useAuthGate } from '../../features/auth'
import { currentMonth, shiftMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { CategoryIcon } from '../../shared/ui/category-icon'
import { Surface } from '../../shared/ui/surface'
import { ChartSummary } from '../../shared/ui/chart-summary'
import { EmptyState } from '../../shared/ui/empty-state'
import './index.scss'


export default function ChartPage() {
  const [month, setMonth] = useState(currentMonth)
  const isAuthenticated = useAuthGate()
  const chartQuery = useMonthChart({ params: { month }, queryOptions: { enabled: isAuthenticated } })
  const summary = chartQuery.data?.summary
  const categories = chartQuery.data?.categories ?? []

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
      <PageHeadingVisual primitive={View} title={<Text className='bill-page-heading__title'>图表</Text>} />
      <View className='row chart-month'>
        <Button className='records-summary__nav' aria-label='上个月' onClick={handlePreviousMonth}>‹</Button><View className='records-summary__period'><PeriodLabel year={month.slice(0, 4)} yearSuffix='年' month={month.slice(5)} monthSuffix='月' primitive={Text} /></View><Button className='records-summary__nav' aria-label='下个月' disabled={month >= currentMonth()} onClick={handleNextMonth}>›</Button>
      </View>
      {chartQuery.isLoading && <View className='state-panel'>正在加载图表…</View>}
      {chartQuery.isError && <EmptyState error title='加载失败' description={errorMessage(chartQuery.error)} actionLabel='重试' onAction={() => void chartQuery.refetch()} />}
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
        {categories.length === 0 && <EmptyState title='本月暂无支出数据' description='有支出记录后，这里会展示分类分布。' />}
        <Surface className='card'>
          {categories.map(category => (
            <View key={category.key ?? category.id ?? category.name} className='bill-ranking-host'>
              <RankingRowVisual
                primitives={{ Box: View, Text }}
                label={category.name}
                amount={`¥${money.format(category.amount)}`}
                percentage={(clampProgress(category.percent ?? 0) * 100).toFixed(1)}
                icon={<CategoryIcon categoryName={category.name} size={16} />}
                progress={<ProgressVisual fraction={clampProgress(category.percent ?? 0)} primitive={View} />}
              />
            </View>
          ))}
        </Surface>
      </>}
    </View>
  )
}
