import { useMemo, useState } from 'react'
import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { getRecordIndicators, getRecordDisplayTitle, groupRecordsByKey, sumRecordAmounts, isDarkCategoryBackground, money, type RecordIndicatorSource } from '@ww-bill/bill-core'
import { AmountToggleVisual, BrandMarkVisual, PageHeadingVisual, RecordSummaryContent, MetricRow, RecordOverviewRowContent, RecordSecondaryContent, RecordDateGroupHeader, RecordDateLabelVisual, RecordGroupSurface, RecordStateSurface, recordIconForeground } from '@ww-bill/bill-ui'
import { appLogo } from '../../shared/lib/presentation-assets'
import { PageLoadingState } from '../../shared/ui/page-loading-state'
import { EmptyState } from '../../shared/ui/empty-state'
import './index.scss'
import { Page } from '../../shared/ui/page'
import { useMonthRecords } from '../../entities/record'
import { useAuthGate, useAuthStore } from '../../features/auth'
import { currentMonth, displayRecordDate } from '../../shared/lib/date'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'
import { MonthPicker } from '../../shared/ui/month-picker'
import { AppButton } from '../../shared/ui/app-button'
import { useAmountVisibility } from '../../features/display-preferences'
import { DesignIcon } from '../../shared/ui/design-icon'
import { CategoryIcon } from '../../shared/ui/category-icon'
import { useAppearanceTemplate } from '../../shared/model/appearance'

function recordIndicators(record: RecordIndicatorSource) {
  return getRecordIndicators(record, (kind, amount) => `${({ refund: '退款', cashback: '返现', supplement: '补款' })[kind]} ¥${amount}`)
}

export default function RecordsPage() {
  const [month, setMonth] = useState(currentMonth)
  const template = useAppearanceTemplate()
  const isAuthenticated = useAuthGate()
  const userId = useAuthStore(state => state.userId)
  const amounts = useAmountVisibility({ userId, enabled: isAuthenticated })
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

  function handleCreate() {
    void Taro.navigateTo({ url: '/pages/record-create/index' })
  }

  return (
    <Page className='page records-page'>
      <PageHeadingVisual className='bill-page-heading--record-overview' primitive={View} icon={<BrandMarkVisual primitive={View} image={<Image className='bill-brand-mark__image' src={appLogo} mode='aspectFill' />} />} title={<Text className='bill-page-heading__title'>鲸浪记账</Text>} />
      <Surface className='records-summary bill-record-summary' material='raised'>
        <RecordSummaryContent primitive={View} period={<MonthPicker month={month} onChange={setMonth} />}
          amountToggle={amounts.switchVisible ? <AmountToggleVisual primitive={Button} onClick={amounts.handleToggle} icon={<DesignIcon name={amounts.visible ? 'amount-visible' : 'amount-hidden'} size={16} />} /> : undefined}
          metrics={<MetricRow
            columns={2}
            variant='detail-summary'
            primitives={{ Root: View, Cell: View, Label: Text, Value: View, Text }}
            items={[
            { key: 'income', label: '收入', value: amounts.isVisible ? money.format(firstPage?.income ?? 0) : '\uff0a'.repeat(5), tone: 'income' },
            { key: 'expense', label: '支出', value: amounts.isVisible ? money.format(firstPage?.expend ?? 0) : '\uff0a'.repeat(5), tone: 'expense' },
          ]}
          />}
        />
      </Surface>
      {recordsQuery.isLoading && <PageLoadingState label='正在加载明细…' />}
      {recordsQuery.isError && <RecordStateSurface primitive={View}><EmptyState error title='加载失败' description={errorMessage(recordsQuery.error)} actionLabel='重试' onAction={() => void recordsQuery.refetch()} /></RecordStateSurface>}
      {!recordsQuery.isLoading && !recordsQuery.isError && records.length === 0 && <RecordStateSurface primitive={View}><EmptyState title='这个月还没有明细' description='记下第一笔收支，月度明细会自动整理在这里' actionLabel='去记一笔' onAction={handleCreate} /></RecordStateSurface>}
      {groups.map((group, groupIndex) => (
        <View key={group.date} className='bill-record-group'>
          <RecordDateGroupHeader date={<Text><RecordDateLabelVisual label={group.date} primitive={Text} /></Text>} primitives={{ Header: View, Text, Box: View }} summaries={recordsQuery.hasNextPage && groupIndex === groups.length - 1 ? undefined : <>{money.compare(group.totals.income, 0) > 0 && <Text className='money--income'>收入 {money.formatNatural(group.totals.income)}</Text>}<Text className='money--expense'>支出 {money.formatNatural(group.totals.expense)}</Text></>} />
          <View className='bill-record-group__body'>
            <RecordGroupSurface single={group.entries.length === 1 && !group.entries.some(record => { const hints = recordIndicators(record); return hints.adjustmentSummary || hints.tagSummary || hints.hasAttachment })} primitive={View}>
              {group.entries.map((record, index) => {
                const indicators = recordIndicators(record)
                const secondary = [indicators.adjustmentSummary, indicators.tagSummary].filter(Boolean).join(' · ') || undefined
                return (
                <View key={record.id} className={`bill-overview-record${secondary || indicators.hasAttachment ? ' bill-overview-record--secondary' : ''}`}>
                  <RecordOverviewRowContent
                    primitives={{ Box: View, Text, Deleted: Text }}
                    amount={record.type === 'sub' ? money.subtract(0, record.amount) : money.formatNatural(record.amount)}
                    amountTone={record.type === 'add' ? 'income' : 'expense'}
                    icon={<View className={`bill-overview-record__icon bill-overview-record__icon--${index % 4}`} style={record.category?.backgroundColor ? { backgroundColor: record.category.backgroundColor } : undefined}><CategoryIcon categoryName={record.category?.name} iconKey={record.category?.icon} iconType={record.category?.iconType} textIconEnabled={record.category?.textIconEnabled} textIconIndex={record.category?.textIconIndex} color={isDarkCategoryBackground(record.category?.backgroundColor) ? '#fff' : recordIconForeground(index, template)} size={18} /></View>}
                    secondary={secondary || indicators.hasAttachment ? <RecordSecondaryContent primitives={{ Box: View, Text }} copy={secondary} attachmentIcon={indicators.hasAttachment ? <DesignIcon name='record-attachment' size={12} tone='active' /> : undefined} /> : undefined}
                    originalAmount={record.originalAmount ? `-${record.originalAmount}` : undefined}
                    primary={getRecordDisplayTitle(record.remark, record.category?.path ?? record.category?.name ?? '未分类')}
                  />
                  {index !== group.entries.length - 1 && <View className='bill-overview-record__divider' />}
                </View>
              )})}
            </RecordGroupSurface>
          </View>
        </View>
      ))}
      {recordsQuery.hasNextPage && <AppButton variant='secondary' className='records-more' disabled={recordsQuery.isFetchingNextPage} onClick={() => void recordsQuery.fetchNextPage()}>{recordsQuery.isFetchingNextPage ? '加载中…' : '加载更多'}</AppButton>}
      {recordsQuery.isError && records.length > 0 && <Text className='error-text'>加载更多失败，请重试</Text>}
    </Page>
  )
}
