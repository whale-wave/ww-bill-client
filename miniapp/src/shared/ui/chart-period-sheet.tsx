import type { ComponentProps } from 'react'
import { useState } from 'react'
import { Button, ScrollView, Text, View } from '@tarojs/components'
import { getMonthPeriodChoices, formatMonthPeriod } from '@ww-bill/bill-core'
import { PeriodSelectionPanel, SheetHeadingVisual } from '@ww-bill/bill-ui'
import { currentMonth, dateKey } from '../lib/date'
import { Sheet } from './sheet'
import { DesignIcon } from './design-icon'

function PeriodScroll(props: ComponentProps<typeof ScrollView>) { return <ScrollView {...props} scrollY /> }

export function ChartPeriodSheet({ month, visible, onClose, onSelect }: { month: string, visible: boolean, onClose: () => void, onSelect: (month: string) => void }) {
  const current = currentMonth()
  const currentYear = Number(current.slice(0, 4))
  const [viewYear, setViewYear] = useState(Number(month.slice(0, 4)))
  const choices = getMonthPeriodChoices(viewYear, dateKey(new Date())).reverse().map(choice => ({ ...choice, title: formatMonthPeriod(choice.startDate.slice(0, 7), current, { thisMonth: '本月', lastMonth: '上月', monthNumber: value => `${value}月`, yearMonthNumber: (year, value) => `${year}年${value}月` }) }))
  return <Sheet visible={visible} opaque className='bill-native-chart-period-sheet' onClose={onClose}>
    <PeriodSelectionPanel primitives={{ Box: View, Text, Button, Scroll: PeriodScroll }}
      header={<SheetHeadingVisual primitives={{ Box: View, Header: View, Text, Title: Text, Button }} title='选择时间' closeLabel='关闭' onClose={onClose} closeIcon={<DesignIcon name='sheet-close' tone='muted' size={18} />} />}
      year={viewYear}
      previous={<Button className='bill-period-selection__year-button' aria-label='更早年份' disabled={viewYear <= 1900} onClick={() => setViewYear(value => Math.max(1900, value - 1))}><DesignIcon name='period-previous' tone={viewYear <= 1900 ? 'soft' : 'active'} size={20} /></Button>}
      next={<Button className='bill-period-selection__year-button' aria-label='更晚年份' disabled={viewYear >= currentYear} onClick={() => setViewYear(value => Math.min(currentYear, value + 1))}><DesignIcon name='period-next' tone={viewYear >= currentYear ? 'soft' : 'active'} size={20} /></Button>}
      scrollStyle={{ height: `min(calc(84vh - 132px), calc(${choices.length * 64 + 4}px + max(20px, var(--ww-safe-area-bottom, 0px))))`, flex: 'none' }}
      choices={choices} selectedStart={`${month}-01`} selectedIcon={<DesignIcon name='period-selected' tone='active' size={18} />} onSelect={value => { onSelect(value.slice(0, 7)); onClose() }}
    />
  </Sheet>
}
