import type { CalculatorAction, CalculatorOptions } from '@ww-bill/bill-core';
import type { SetStateAction } from 'react';
import { applyCalculatorAction, canCalculateCalculator, canSubmitCalculator, createCalculatorState } from '@ww-bill/bill-core';
import { useCallback, useState } from 'react';

export type { CalculatorState } from '@ww-bill/bill-core';

export function useCalculator(options: CalculatorOptions = {}) {
  const [state, setState] = useState(() => createCalculatorState(options));
  const apply = useCallback((action: CalculatorAction) => {
    const result = applyCalculatorAction(state, action);
    setState(result.state);
    return result.amount;
  }, [state]);
  const inputDigit = useCallback((value: number) => {
    apply({ type: 'digit', value });
  }, [apply]);
  const inputDecimal = useCallback(() => {
    apply({ type: 'decimal' });
  }, [apply]);
  const inputDelete = useCallback(() => {
    apply({ type: 'delete' });
  }, [apply]);
  const inputOperator = useCallback((value: string) => {
    apply({ type: 'operator', value });
  }, [apply]);
  const resolveAmount = useCallback(() => apply({ type: 'resolve' }), [apply]);
  const canSubmit = useCallback(() => canSubmitCalculator(state), [state]);
  const canCalculate = useCallback(() => canCalculateCalculator(state), [state]);
  const updateField = useCallback((field: 'num' | 'totals' | 'addition', value: SetStateAction<string>) => {
    setState(current => ({ ...current, [field]: typeof value === 'function' ? value(current[field]) : value }));
  }, []);
  const setNum = useCallback((value: SetStateAction<string>) => updateField('num', value), [updateField]);
  const setTotals = useCallback((value: SetStateAction<string>) => updateField('totals', value), [updateField]);
  const setAddition = useCallback((value: SetStateAction<string>) => updateField('addition', value), [updateField]);
  return { ...state, inputDigit, inputDecimal, inputDelete, inputOperator, inputOperatorState: inputOperator, resolveAmount, canSubmit, canCalculate, setNum, setTotals, setAddition };
}
