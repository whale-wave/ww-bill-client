import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { money } from '@ww-bill/bill-core'
import { MetricRow, RecordLine, type RecordLinePrimitives } from '@ww-bill/bill-ui'
import { useMonthRecords } from '../../entities/record'
import { useAuthGate } from '../../features/auth'
import { currentMonth, displayRecordDate, shiftMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import './index.scss'

const recordLinePrimitives: RecordLinePrimitives = { Box: View, Text }

export default function RecordsPage() {
  const [month, setMonth] = useState(currentMonth)
  const isAuthenticated = useAuthGate()
  const recordsQuery = useMonthRecords({ params: { month }, queryOptions: { enabled: isAuthenticated } })
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

  function handlePreviousMonth() {
    setMonth(value => shiftMonth(value, -1))
  }
  function handleNextMonth() {
    if (month < currentMonth())
      setMonth(value => shiftMonth(value, 1))
  }
  function handleCreate() {
    void Taro.navigateTo({ url: '/pages/record-create/index' })
  }

  return (
    <View className='page'>
      <Text className='page__title'>明细</Text>
      <Surface className='card records-summary' material='raised'>
        <View className='row records-summary__month'>
          <Button className='records-summary__nav' aria-label='上个月' onClick={handlePreviousMonth}>‹</Button>
          <Text>{month.replace('-', '年')}月</Text>
          <Button className={`records-summary__nav${month >= currentMonth() ? ' muted' : ''}`} aria-label='下个月' disabled={month >= currentMonth()} onClick={handleNextMonth}>›</Button>
        </View>
        <MetricRow
          columns={2}
          variant='detail-summary'
          primitives={{ Root: View, Cell: View, Label: Text, Value: View, Text }}
          items={[
            { key: 'income', label: '收入', value: `¥${money.format(firstPage?.income ?? 0)}`, tone: 'income' },
            { key: 'expense', label: '支出', value: `¥${money.format(firstPage?.expend ?? 0)}`, tone: 'expense' },
          ]}
        />
      </Surface>
      <View className='row'><Text className='section-title'>该月记录</Text><Text className='muted'>{firstPage?.total ?? 0} 笔</Text></View>
      {recordsQuery.isLoading && <View className='state-panel'>正在加载明细…</View>}
      {recordsQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(recordsQuery.error)}</Text><AppButton variant='secondary' onClick={() => void recordsQuery.refetch()}>重试</AppButton></View>}
      {!recordsQuery.isLoading && !recordsQuery.isError && records.length === 0 && <View className='state-panel'>这个月还没有记录，记下第一笔吧。</View>}
      {records.map((record, index) => (
        <View key={record.id} className='record-row'>
          <RecordLine
            amount={`${record.type === 'add' ? '+' : '-'}¥${money.format(record.amount)}`}
            amountTone={record.type === 'add' ? 'income' : 'expense'}
            icon={<Text>{(record.category?.name ?? '未').slice(0, 1)}</Text>}
            isLast={index === records.length - 1}
            primitives={recordLinePrimitives}
            subtitle={`${record.remark ? `${record.remark} · ` : ''}${displayRecordDate(record.time)}`}
            title={record.category?.path ?? record.category?.name ?? '未分类'}
          />
        </View>
      ))}
      {recordsQuery.hasNextPage && <AppButton variant='secondary' className='records-more' disabled={recordsQuery.isFetchingNextPage} onClick={() => void recordsQuery.fetchNextPage()}>{recordsQuery.isFetchingNextPage ? '加载中…' : '加载更多'}</AppButton>}
      {recordsQuery.isError && records.length > 0 && <Text className='error-text'>加载更多失败，请重试</Text>}
      <AppButton className='records-create' onClick={handleCreate}>记一笔</AppButton>
    </View>
  )
}
