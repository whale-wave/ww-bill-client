import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { money } from '@ww-bill/bill-core'
import { useMonthRecords } from '../../entities/record/queries'
import { useAuthGate } from '../../features/auth/use-auth-gate'
import { currentMonth, displayRecordDate, shiftMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import './index.scss'

export default function RecordsPage() {
  const [month, setMonth] = useState(currentMonth)
  const isAuthenticated = useAuthGate()
  const recordsQuery = useMonthRecords(month, isAuthenticated)
  const firstPage = recordsQuery.data?.pages[0]
  const records = recordsQuery.data?.pages.flatMap(page => page.data) ?? []

  useDidShow(() => {
    if (isAuthenticated)
      void recordsQuery.refetch()
  })
  usePullDownRefresh(async () => {
    await recordsQuery.refetch()
    await Taro.stopPullDownRefresh()
  })
  useReachBottom(() => {
    if (recordsQuery.hasNextPage && !recordsQuery.isFetchingNextPage)
      void recordsQuery.fetchNextPage()
  })

  function handlePreviousMonth() { setMonth(value => shiftMonth(value, -1)) }
  function handleNextMonth() {
    if (month < currentMonth())
      setMonth(value => shiftMonth(value, 1))
  }
  function handleCreate() { void Taro.navigateTo({ url: '/pages/record-create/index' }) }

  return (
    <View className='page'>
      <Text className='page__title'>明细</Text>
      <View className='card records-summary'>
        <View className='row records-summary__month'>
          <Text onClick={handlePreviousMonth}>‹</Text>
          <Text>{month.replace('-', '年')}月</Text>
          <Text onClick={handleNextMonth} className={month >= currentMonth() ? 'muted' : ''}>›</Text>
        </View>
        <View className='records-summary__metrics'>
          <View><Text className='muted'>收入</Text><Text className='money money--income'>¥{money.format(firstPage?.income ?? 0)}</Text></View>
          <View><Text className='muted'>支出</Text><Text className='money money--expense'>¥{money.format(firstPage?.expend ?? 0)}</Text></View>
        </View>
      </View>
      <View className='row'><Text className='section-title'>本月记录</Text><Text className='muted'>{firstPage?.total ?? 0} 笔</Text></View>
      {recordsQuery.isLoading && <View className='state-panel'>正在加载明细…</View>}
      {recordsQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(recordsQuery.error)}</Text><Button className='button button--plain' onClick={() => void recordsQuery.refetch()}>重试</Button></View>}
      {!recordsQuery.isLoading && !recordsQuery.isError && records.length === 0 && <View className='state-panel'>这个月还没有记录，记下第一笔吧。</View>}
      {records.map(record => (
        <View key={record.id} className='record-row'>
          <View className='record-row__main'>
            <Text className='record-row__category'>{record.category?.name ?? '未分类'}</Text>
            <Text className='muted'>{record.remark || displayRecordDate(record.time)} · {displayRecordDate(record.time)}</Text>
          </View>
          <Text className={`money ${record.type === 'add' ? 'money--income' : 'money--expense'}`}>{record.type === 'add' ? '+' : '-'}¥{money.format(record.amount)}</Text>
        </View>
      ))}
      {recordsQuery.hasNextPage && <Button className='button button--plain records-more' disabled={recordsQuery.isFetchingNextPage} onClick={() => void recordsQuery.fetchNextPage()}>{recordsQuery.isFetchingNextPage ? '加载中…' : '加载更多'}</Button>}
      {recordsQuery.isError && records.length > 0 && <Text className='error-text'>加载更多失败，请重试</Text>}
      <Button className='button records-create' onClick={handleCreate}>记一笔</Button>
    </View>
  )
}
