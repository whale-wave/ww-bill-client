import { useState } from 'react'
import { applyCalculatorAction, canCalculateCalculator, canSubmitCalculator, createCalculatorState, type CalculatorAction } from '@ww-bill/bill-core'

export function useCalculator() {
  const [state, setState] = useState(createCalculatorState)
  function handleAction(action: CalculatorAction) {
    setState(current => applyCalculatorAction(current, action).state)
  }
  function resolveAmount() {
    const result = applyCalculatorAction(state, { type: 'resolve' })
    setState(result.state)
    return result.amount
  }
  return { ...state, handleAction, resolveAmount, canCalculate: canCalculateCalculator(state), canSubmit: canSubmitCalculator(state) }
}
