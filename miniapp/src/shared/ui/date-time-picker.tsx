import { useState } from 'react'
import { Button, PickerView, PickerViewColumn, Text, View } from '@tarojs/components'
import { calendarWheel, type CalendarParts } from '@ww-bill/bill-core'
import { DateTimePickerVisual } from '@ww-bill/bill-ui'
import { dateKey, timeKey } from '../lib/date'
import { Sheet } from './sheet'

const pad = (value: number) => String(value).padStart(2, '0')
const parts = (date: string, time: string): CalendarParts => [...date.split('-').map(Number), ...time.split(':').map(Number), ...(time.length === 5 ? [0] : [])] as CalendarParts

export function DateTimePicker({ date, time, onClose, onConfirm }: { date: string, time: string, onClose: () => void, onConfirm: (date: string, time: string) => void }) {
  const [bounds] = useState(() => {
    const now = new Date()
    const current = parts(dateKey(now), timeKey(now, true))
    return { min: [current[0] - 10, ...current.slice(1)] as CalendarParts, max: [current[0] + 10, ...current.slice(1)] as CalendarParts }
  })
  const [draft, setDraft] = useState(() => parts(date, time))
  const wheel = calendarWheel(draft, bounds.min, bounds.max)
  return <Sheet visible opaque onClose={onClose}>
    <DateTimePickerVisual primitives={{ Box: View, Text }} title='时间选择'
      cancel={<Button className='bill-date-time-picker__button' onClick={onClose}>取消</Button>}
      confirm={<Button className='bill-date-time-picker__button bill-date-time-picker__confirm' onClick={() => { const [year, month, day, hour, minute, second] = wheel.selected; onConfirm(`${year}-${pad(month)}-${pad(day)}`, `${pad(hour)}:${pad(minute)}:${pad(second)}`); onClose() }}>确定</Button>}
      wheels={<PickerView className='bill-date-time-picker__wheels' value={wheel.indices} indicatorClass='bill-date-time-picker__indicator' indicatorStyle='height:44px;border:0;' immediateChange ariaLabel='日期和时间' onChange={event => setDraft(wheel.columns.map((values, index) => values[Math.min(event.detail.value[index], values.length - 1)]) as CalendarParts)}>
        {wheel.columns.map((values, index) => <PickerViewColumn key={index}>{values.map(value => <View key={value} className={`bill-date-time-picker__item${value === wheel.selected[index] ? ' bill-date-time-picker__item--selected' : ''}`}>{index === 0 ? value : pad(value)}</View>)}</PickerViewColumn>)}
      </PickerView>}
    />
  </Sheet>
}
