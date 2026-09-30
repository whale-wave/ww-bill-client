import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { money } from '@ww-bill/bill-core'
import { useMonthChart } from '../../entities/chart'
import { useAuthGate } from '../../features/auth'
import { currentMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import './index.scss'

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
      <View className='card discover-overview'>
        <Text className='muted'>本月账单</Text>
        {chartQuery.isLoading && <Text>正在加载…</Text>}
        {chartQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(chartQuery.error)}</Text><Button className='button button--plain' onClick={() => void chartQuery.refetch()}>重试</Button></View>}
        {chartQuery.data && <>
          <Text className='money discover-overview__amount'>¥{money.format(chartQuery.data.summary.expense)}</Text>
          <Text className='muted'>本月支出 · 收入 ¥{money.format(chartQuery.data.summary.income)}</Text>
        </>}
        <Button className='button button--plain' onClick={handleOpenChart}>查看图表</Button>
      </View>
      <Text className='section-title'>常用入口</Text>
      <View className='discover-actions'>
        <View className='card discover-actions__item' onClick={handleOpenRecords}><Text>明细</Text><Text className='muted'>查看收支记录</Text></View>
        <View className='card discover-actions__item' onClick={handleCreate}><Text>记一笔</Text><Text className='muted'>快速记录收支</Text></View>
      </View>
    </View>
  )
}
