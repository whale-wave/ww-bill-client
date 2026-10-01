import { Button, Text, View } from '@tarojs/components'
import { RecordKeypadLayout, recordKeypadKeys } from '@ww-bill/bill-ui'
import type { CalculatorAction } from '@ww-bill/bill-core'
import { DesignIcon } from './design-icon'

export function RecordKeypad({ canCalculate, canSubmit, operatorsEnabled, isCalculationPending, isSubmitting, onAction, onComplete }: {
  canCalculate: boolean
  canSubmit: boolean
  operatorsEnabled: boolean
  isCalculationPending: boolean
  isSubmitting: boolean
  onAction: (action: CalculatorAction) => void
  onComplete: () => void
}) {
  return (
    <RecordKeypadLayout
      primitives={{ Root: View, Box: View }}
      actions={<>
        {['+', '-'].map(operator => <Button key={operator} className='record-editor-keypad__action record-editor-keypad__operator' disabled={!operatorsEnabled || isSubmitting} onClick={() => onAction({ type: 'operator', value: operator })}>{operator}</Button>)}
        <Button className='record-editor-keypad__action record-editor-keypad__submit' disabled={isSubmitting || (isCalculationPending ? !canCalculate : !canSubmit)} onClick={onComplete}>{isCalculationPending ? '=' : '完成'}</Button>
      </>}
      keys={recordKeypadKeys.map(({ keys }) => (
        <Button key={keys} className={`record-editor-keypad__key${keys === 'x' ? ' record-editor-keypad__delete record-editor-keypad__key--active' : ''}`} disabled={isSubmitting} onClick={() => onAction(typeof keys === 'number' ? { type: 'digit', value: keys } : { type: keys === '.' ? 'decimal' : 'delete' })}>
          {keys === 'x' && <DesignIcon name='editor-delete' size={20} tone='category' />}
          <Text>{keys === 'x' ? '删除' : keys}</Text>
        </Button>
      ))}
    />
  )
}
