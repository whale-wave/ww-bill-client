import { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import { MonthSelectionPanel, PeriodLabel } from '@ww-bill/bill-ui'
import { currentMonth } from '../lib/date'
import { Sheet } from './sheet'
import { AppButton } from './app-button'
import { DesignIcon } from './design-icon'

/** Platform-local sheet state. Public components only receive display props. */
export function MonthPicker({ month, onChange }: { month: string, onChange: (month: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [draft, setDraft] = useState(month)
  const current = currentMonth()
  const currentYear = Number(current.slice(0, 4))
  const draftYear = Number(draft.slice(0, 4))
  const isFuture = draft > current
  function handleOpen() { setDraft(month); setVisible(true) }
  function handleConfirm() {
    if (isFuture)
      return
    onChange(draft)
    setVisible(false)
  }
  return <>
    <Button className='bill-month-picker-trigger' onClick={handleOpen} aria-label='选择月份'>
      <PeriodLabel primitive={Text} year={month.slice(0, 4)} yearSuffix='年' month={month.slice(5)} monthSuffix='月' /><DesignIcon name='period-chevron' size={14} />
    </Button>
    <Sheet visible={visible} onClose={() => setVisible(false)}>
        <MonthSelectionPanel primitives={{ Box: View, Text, Button }} title='选择年月' closeLabel='关闭' yearLabel='年份' monthLabel='月份' onClose={() => setVisible(false)}
          onYear={year => setDraft(`${year}-${draft.slice(5)}`)} onMonth={value => setDraft(`${draftYear}-${String(value + 1).padStart(2, '0')}`)}
          years={Array.from({ length: 6 }, (_, index) => currentYear - 5 + index).map(year => ({ value: year, label: `${year}年`, selected: year === draftYear }))}
          months={Array.from({ length: 12 }, (_, value) => ({ value, label: `${value + 1}月`, selected: value === Number(draft.slice(5)) - 1, disabled: draftYear === currentYear && value + 1 > Number(current.slice(5)) }))}
          hint={isFuture ? '所选月份尚未到来，请选择当前或过去的月份' : undefined}
          action={<AppButton data-testid='record-month-confirm' disabled={isFuture} onClick={handleConfirm}>确认</AppButton>}
        />
    </Sheet>
  </>
}
