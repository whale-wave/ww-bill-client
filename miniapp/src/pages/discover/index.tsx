import { PageHeadingVisual } from '@ww-bill/bill-ui'
import { useState } from 'react'
import { Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { formatBillOverviewAmount } from '@ww-bill/bill-core'
import { BillOverviewVisual, MetricRow, type MetricRowPrimitives } from '@ww-bill/bill-ui'
import { PageLoadingState } from '../../shared/ui/page-loading-state'
import { EmptyState } from '../../shared/ui/empty-state'
import './index.scss'
import { Page } from '../../shared/ui/page'
import { useMonthChart } from '../../entities/chart'
import { useAuthGate } from '../../features/auth'
import { currentMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { DesignIcon } from '../../shared/ui/design-icon'
import { ActionMenu } from '../../shared/ui/action-menu'
import { Surface } from '../../shared/ui/surface'

const metricPrimitives: MetricRowPrimitives = { Root: View, Cell: View, Label: Text, Value: View, Text }

export default function DiscoverPage() {
  const [month, setMonth] = useState(currentMonth)
  const isAuthenticated = useAuthGate()
  const chartQuery = useMonthChart({ params: { month }, queryOptions: { enabled: isAuthenticated } })

  useDidShow(() => {
    const current = currentMonth()
    if (current !== month)
      setMonth(current)
    else if (isAuthenticated)
      void chartQuery.refetch()
  })

  function handleOpenChart() { void Taro.switchTab({ url: '/pages/chart/index' }) }
  function handleOpenRecords() { void Taro.switchTab({ url: '/pages/index/index' }) }
  function handleCreate() { void Taro.navigateTo({ url: '/pages/record-create/index' }) }

  return (
    <Page className='page discover-page'>
      <PageHeadingVisual primitive={View} className='bill-page-heading--discovery' title={<Text className='bill-page-heading__title'>发现</Text>} />
      <Surface className='bill-overview-surface discover-overview' material='raised'>
        {chartQuery.isLoading && <PageLoadingState compact label='正在加载…' />}
        {chartQuery.isError && <EmptyState error title='加载失败' description={errorMessage(chartQuery.error)} actionLabel='重试' onAction={() => void chartQuery.refetch()} />}
        {chartQuery.data && <View onClick={handleOpenChart}>
          <BillOverviewVisual title='账单' period={`${month.slice(5)}月`} primitives={{ Box: View, Text }} icon={<DesignIcon name='discovery-bill' size={18} tone='category' />} metrics={
            <MetricRow density='compact' items={[
              { key: 'income', label: '收入', tone: 'income', value: formatBillOverviewAmount(chartQuery.data.summary.income) },
              { key: 'expense', label: '支出', tone: 'expense', value: formatBillOverviewAmount(chartQuery.data.summary.expense) },
              { key: 'surplus', label: '结余', tone: 'primary', value: formatBillOverviewAmount(chartQuery.data.summary.net) },
            ]} primitives={metricPrimitives}
            />
          }
          />
        </View>}
      </Surface>
      <Text className='bill-section-heading'>常用功能</Text>
      <ActionMenu items={[
        { key: 'records', label: '明细', icon: 'tab-detail', onClick: handleOpenRecords },
        { key: 'create', label: '记一笔', icon: 'tab-add', onClick: handleCreate },
      ]}
      />
    </Page>
  )
}
