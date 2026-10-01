import { useState } from 'react'
import { Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { money } from '@ww-bill/bill-core'
import { BillOverviewVisual, MetricRow, type MetricRowPrimitives } from '@ww-bill/bill-ui'
import { useMonthChart } from '../../entities/chart'
import { useAuthGate } from '../../features/auth'
import { currentMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { DesignIcon } from '../../shared/ui/design-icon'
import { ActionMenu } from '../../shared/ui/action-menu'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import './index.scss'

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
    <View className='page'>
      <Text className='page__title'>发现</Text>
      <Surface className='card discover-overview' material='raised'>
        {chartQuery.isLoading && <Text>正在加载…</Text>}
        {chartQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(chartQuery.error)}</Text><AppButton variant='secondary' onClick={() => void chartQuery.refetch()}>重试</AppButton></View>}
        {chartQuery.data && <View onClick={handleOpenChart}>
          <BillOverviewVisual title='本月账单' period={`${month.slice(5)}月`} primitives={{ Box: View, Text }} icon={<DesignIcon name='discovery-bill' size={18} tone='category' />} metrics={
            <MetricRow density='compact' items={[
              { key: 'income', label: '收入', tone: 'income', value: `¥${money.format(chartQuery.data.summary.income)}` },
              { key: 'expense', label: '支出', tone: 'expense', value: `¥${money.format(chartQuery.data.summary.expense)}` },
              { key: 'surplus', label: '结余', tone: 'primary', value: `¥${money.format(chartQuery.data.summary.net)}` },
            ]} primitives={metricPrimitives}
            />
          }
          />
        </View>}
      </Surface>
      <Text className='section-title'>常用入口</Text>
      <ActionMenu columns={2} variant='card' items={[
        { key: 'records', label: '明细', icon: 'tab-detail', onClick: handleOpenRecords },
        { key: 'create', label: '记一笔', icon: 'tab-add', onClick: handleCreate },
      ]}
      />
    </View>
  )
}
