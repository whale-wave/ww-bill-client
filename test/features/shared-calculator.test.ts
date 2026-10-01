import type { CalculatorAction } from '@ww-bill/bill-core';
import { applyCalculatorAction, canCalculateCalculator, canSubmitCalculator, createCalculatorState } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';

function enter(keys: string) {
  let state = createCalculatorState();
  for (const key of keys) {
    const action: CalculatorAction = /\d/.test(key)
      ? { type: 'digit', value: Number(key) }
      : key === '.' ? { type: 'decimal' } : { type: 'operator', value: key };
    state = applyCalculatorAction(state, action).state;
  }
  return state;
}

describe('shared money calculator', () => {
  it('calculates decimal money without binary floating point rounding', () => {
    const pending = enter('0.1+0.2');
    expect(canCalculateCalculator(pending)).toBe(true);
    const result = applyCalculatorAction(pending, { type: 'resolve' });
    expect(result.amount).toBe('0.3');
    expect(canSubmitCalculator(result.state)).toBe(true);
  });
  it.each(['1-1', '1-2', '1+', '1+.'])('does not resolve invalid or unfinished expression %s', (keys) => {
    const pending = enter(keys);
    expect(canCalculateCalculator(pending)).toBe(false);
    expect(applyCalculatorAction(pending, { type: 'resolve' }).amount).toBeUndefined();
    expect(canSubmitCalculator(pending)).toBe(false);
  });
  it('limits operands to eight integer digits and two decimal digits', () => {
    expect(enter('123456789.123').totals).toBe('12345678.12');
    expect(enter('1+123456789.123').totals).toBe('1+12345678.12');
  });
  it('supports successive operations and deletion of an unfinished operator', () => {
    expect(enter('7+2-').totals).toBe('9-');
    const state = applyCalculatorAction(enter('7+2-'), { type: 'delete' }).state;
    expect(state.totals).toBe('9');
    expect(canSubmitCalculator(state)).toBe(true);
  });
  it('keeps input state immutable for independent platform controllers', () => {
    const initial = Object.freeze(createCalculatorState());
    const first = applyCalculatorAction(initial, { type: 'digit', value: 7 }).state;
    expect(initial.totals).toBe('0.00');
    expect(first.totals).toBe('7');
    expect(applyCalculatorAction(initial, { type: 'digit', value: 2 }).state.totals).toBe('2');
  });
});
