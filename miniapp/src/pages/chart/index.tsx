import { DashboardHeadingVisual, DashboardSummaryVisual, DashboardTrendVisual, DashboardSwitchVisual, DashboardCategoriesVisual, DashboardCategoryRowContent, DashboardDonutLabel, PeriodLabel } from '@ww-bill/bill-ui'
import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { formatDashboardAmount, formatChartPercent, getChartAverage } from '@ww-bill/bill-core'
import { PageLoadingState } from '../../shared/ui/page-loading-state'
import { EmptyState } from '../../shared/ui/empty-state'
import './index.scss'
import { Page } from '../../shared/ui/page'
import { useMonthChart } from '../../entities/chart'
import { useAuthGate } from '../../features/auth'
import { currentMonth, shiftMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { CategoryIcon } from '../../shared/ui/category-icon'
import { Surface } from '../../shared/ui/surface'
import { ChartTrend } from '../../shared/ui/chart-trend'
import { ChartDonut } from '../../shared/ui/chart-donut'


export default function ChartPage() {
  const [month, setMonth] = useState(currentMonth)
  const [metric, setMetric] = useState<'expense' | 'income' | 'net'>('expense')
  const isAuthenticated = useAuthGate()
  const chartQuery = useMonthChart({ params: { month }, queryOptions: { enabled: isAuthenticated } })
  const summary = chartQuery.data?.summary
  const categories = (metric === 'income' ? chartQuery.data?.incomeCategories : chartQuery.data?.categories) ?? []

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
    <Page className='page chart-page bill-dashboard-canvas'>
      <DashboardHeadingVisual primitives={{ Box: View, Title: Text }} title='统计' />
      <View className='row chart-month'>
        <Button className='records-summary__nav' aria-label='上个月' onClick={handlePreviousMonth}>‹</Button><View className='records-summary__period'><PeriodLabel year={month.slice(0, 4)} yearSuffix='年' month={month.slice(5)} monthSuffix='月' primitive={Text} /></View><Button className='records-summary__nav' aria-label='下个月' disabled={month >= currentMonth()} onClick={handleNextMonth}>›</Button>
      </View>
      {chartQuery.isLoading && <PageLoadingState label='正在加载图表…' />}
      {chartQuery.isError && <EmptyState error title='加载失败' description={errorMessage(chartQuery.error)} actionLabel='重试' onAction={() => void chartQuery.refetch()} />}
      {summary && <>
        <Surface className='bill-dashboard-section chart-section' material='content'>
          <DashboardSummaryVisual primitives={{ Box: View, Text, Title: Text }} title='收支摘要' period={`${summary.dayCount ?? 0} 天`} items={[
            { key: 'expense', label: '支出', amount: formatDashboardAmount(summary.expense), tone: 'normal' },
            { key: 'income', label: '收入', amount: formatDashboardAmount(summary.income), tone: 'income' },
            { key: 'net', label: '结余', amount: formatDashboardAmount(summary.net), tone: 'normal' },
            { key: 'average', label: '日均支出', amount: formatDashboardAmount(summary.averageDailyExpense ?? 0), tone: 'muted' },
          ]}
          />
        </Surface>
        <Surface className='bill-dashboard-section chart-section' material='content'>
          <DashboardTrendVisual primitives={{ Box: View, Text, Title: Text }} title='收支趋势'
            controls={<DashboardSwitchVisual<'expense' | 'income' | 'net'> primitives={{ Box: View, Button, Text }} label='收支趋势' options={[{ label: '支出', value: 'expense' }, { label: '收入', value: 'income' }, { label: '结余', value: 'net' }]} value={metric} onChange={setMetric} />}
            chart={<ChartTrend timeline={chartQuery.data?.timeline ?? []} metric={metric} />}
            start={chartQuery.data?.timeline[0]?.label ?? chartQuery.data?.timeline[0]?.key}
            end={chartQuery.data?.timeline.at(-1)?.label ?? chartQuery.data?.timeline.at(-1)?.key}
            average={`日均: ${formatDashboardAmount(getChartAverage((chartQuery.data?.timeline ?? []).map(day => Number(day[metric] ?? 0))))}`}
          />
        </Surface>
        <Surface className='bill-dashboard-section chart-section' material='content'>
          <DashboardCategoriesVisual primitives={{ Box: View, Text, Title: Text }} title='分类构成与排行'
            donut={<><ChartDonut categories={categories} /><DashboardDonutLabel primitives={{ Box: View, Text }} label={metric === 'income' ? '总收入' : '总支出'} amount={formatDashboardAmount(metric === 'income' ? summary.income : summary.expense)} /></>}
            rows={categories.map(category => <View key={category.key ?? category.id ?? category.name} className='bill-dashboard-category-row'>
              <DashboardCategoryRowContent primitives={{ Box: View, Text }}
                icon={<View className='bill-dashboard-category-row__icon'><CategoryIcon categoryName={category.name} iconKey={category.icon ?? 'receipt'} iconType={category.iconType ?? 'BUILTIN'} textIconEnabled={category.textIconEnabled ?? false} textIconIndex={category.textIconIndex ?? 0} size={20} /></View>}
                label={category.name} amount={formatDashboardAmount(category.amount)} percentage={formatChartPercent(category.percent ?? 0)}
              />
            </View>)}
            other={categories.length > 5 ? `其他：${formatDashboardAmount(categories.slice(5).reduce((sum, category) => sum + Number(category.amount), 0))}` : undefined}
            empty={categories.length === 0 ? '暂无分类数据' : undefined}
          />
        </Surface>
      </>}
    </Page>
  )
}
