import { useMemo, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { getRecordDisplayTitle, groupRecordsByKey, sumRecordAmounts, isDarkCategoryBackground, money } from '@ww-bill/bill-core'
import { PageHeadingVisual, RecordSummaryContent, MetricRow, PeriodLabel, RecordOverviewRowContent, RecordDateGroupHeader, RecordDateLabelVisual, RecordGroupSurface, RecordStateSurface } from '@ww-bill/bill-ui'
import { PageLoadingState } from '../../shared/ui/page-loading-state'
import { EmptyState } from '../../shared/ui/empty-state'
import './index.scss'
import { Page } from '../../shared/ui/page'
import { useMonthRecords } from '../../entities/record'
import { useAuthGate } from '../../features/auth'
import { currentMonth, displayRecordDate, shiftMonth } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import { CategoryIcon } from '../../shared/ui/category-icon'

export default function RecordsPage() {
  const [month, setMonth] = useState(currentMonth)
  const isAuthenticated = useAuthGate()
  const recordsQuery = useMonthRecords({ params: { month }, queryOptions: { enabled: isAuthenticated } })
  const firstPage = recordsQuery.data?.pages[0]
  const records = useMemo(() => recordsQuery.data?.pages.flatMap(page => page.data) ?? [], [recordsQuery.data])

  const groups = useMemo(() => {
    const grouped = groupRecordsByKey(records, record => displayRecordDate(record.time))
    return Array.from(grouped, ([date, entries]) => ({ date, entries, totals: sumRecordAmounts(entries) }))
  }, [records])

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
    <Page className='page records-page'>
      <PageHeadingVisual className='bill-page-heading--record-overview' primitive={View} title={<Text className='bill-page-heading__title'>鲸浪记账</Text>} />
      <Surface className='records-summary bill-record-summary' material='raised'>
        <RecordSummaryContent primitive={View} period={<View className='records-summary__period'><PeriodLabel year={month.slice(0, 4)} yearSuffix='年' month={month.slice(5)} monthSuffix='月' primitive={Text} /></View>}
          amountToggle={<View className='records-summary__navigation'>
            <Button className='records-summary__nav' aria-label='上个月' onClick={handlePreviousMonth}>‹</Button>
            <Button className={`records-summary__nav${month >= currentMonth() ? ' records-summary__nav--disabled' : ''}`} aria-label='下个月' disabled={month >= currentMonth()} onClick={handleNextMonth}>›</Button>
          </View>}
          metrics={<MetricRow
            columns={2}
            variant='detail-summary'
            primitives={{ Root: View, Cell: View, Label: Text, Value: View, Text }}
            items={[
            { key: 'income', label: '收入', value: money.format(firstPage?.income ?? 0), tone: 'income' },
            { key: 'expense', label: '支出', value: money.format(firstPage?.expend ?? 0), tone: 'expense' },
          ]}
          />}
        />
      </Surface>
      {recordsQuery.isLoading && <PageLoadingState label='正在加载明细…' />}
      {recordsQuery.isError && <RecordStateSurface primitive={View}><EmptyState error title='加载失败' description={errorMessage(recordsQuery.error)} actionLabel='重试' onAction={() => void recordsQuery.refetch()} /></RecordStateSurface>}
      {!recordsQuery.isLoading && !recordsQuery.isError && records.length === 0 && <RecordStateSurface primitive={View}><EmptyState title='这个月还没有明细' description='记下第一笔收支，月度明细会自动整理在这里' actionLabel='去记一笔' onAction={handleCreate} /></RecordStateSurface>}
      {groups.map(group => (
        <View key={group.date} className='bill-record-group'>
          <RecordDateGroupHeader date={<Text><RecordDateLabelVisual label={group.date} primitive={Text} /></Text>} primitives={{ Header: View, Text, Box: View }} summaries={<><Text className='money--income'>收入 {money.format(group.totals.income)}</Text><Text className='money--expense'>支出 {money.format(group.totals.expense)}</Text></>} />
          <View className='bill-record-group__body'>
            <RecordGroupSurface single={group.entries.length === 1 && !group.entries[0].category?.path?.includes('/')} primitive={View}>
              {group.entries.map((record, index) => (
                <View key={record.id} className={`bill-overview-record${record.category?.path?.includes('/') ? ' bill-overview-record--secondary' : ''}`}>
                  <RecordOverviewRowContent
                    primitives={{ Box: View, Text, Deleted: Text }}
                    amount={`${record.type === 'sub' ? '-' : ''}${money.format(record.amount)}`}
                    amountTone={record.type === 'add' ? 'income' : 'expense'}
                    icon={<View className={`bill-overview-record__icon bill-overview-record__icon--${index % 4}`} style={record.category?.backgroundColor ? { backgroundColor: record.category.backgroundColor } : undefined}><CategoryIcon categoryName={record.category?.name} iconKey={record.category?.icon} iconType={record.category?.iconType} textIconEnabled={record.category?.textIconEnabled} textIconIndex={record.category?.textIconIndex} color={isDarkCategoryBackground(record.category?.backgroundColor) ? '#fff' : undefined} size={18} /></View>}
                    secondary={record.category?.path?.includes('/') ? record.category.path : undefined}
                    primary={getRecordDisplayTitle(record.remark, record.category?.path ?? record.category?.name ?? '未分类')}
                  />
                  {index !== group.entries.length - 1 && <View className='bill-overview-record__divider' />}
                </View>
              ))}
            </RecordGroupSurface>
          </View>
        </View>
      ))}
      {recordsQuery.hasNextPage && <AppButton variant='secondary' className='records-more' disabled={recordsQuery.isFetchingNextPage} onClick={() => void recordsQuery.fetchNextPage()}>{recordsQuery.isFetchingNextPage ? '加载中…' : '加载更多'}</AppButton>}
      {recordsQuery.isError && records.length > 0 && <Text className='error-text'>加载更多失败，请重试</Text>}
    </Page>
  )
}
