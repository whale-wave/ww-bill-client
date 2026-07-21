import { describe, expect, it } from 'vitest';
import { HouseholdBudgetPeriodType, householdKeys, HouseholdStatus } from '@/entities/household';

describe('household query keys', () => {
  it('isolates mine, scoped resources and record filters', () => {
    expect(householdKeys.mine()).toEqual(['household', 'mine']);
    expect(householdKeys.detail('h/a')).toEqual(['household', 'detail', 'h/a']);
    expect(householdKeys.members('h/a')).toEqual(['household', 'member', 'h/a']);
    expect(householdKeys.invitation('h/a')).toEqual(['household', 'invitation', 'h/a']);
    expect(householdKeys.records('h/a', { keyword: '餐' })).toEqual([
      'household',
      'record',
      'h/a',
      { keyword: '餐' },
    ]);
    expect(householdKeys.records('h/a', { keyword: '餐' })).not.toEqual(
      householdKeys.records('h/a', { keyword: '车' }),
    );
    expect(householdKeys.recordPolicy('h/a', 7)).toEqual([
      'household',
      'record-policy',
      'h/a',
      7,
    ]);
    expect(householdKeys.record('h/a', 7)).toEqual([
      'household',
      'record',
      'h/a',
      7,
    ]);
    expect(HouseholdStatus.ACTIVE).toBe('ACTIVE');
    expect(householdKeys.budgets('h/a', { periodStart: '2026-07-01', periodType: HouseholdBudgetPeriodType.MONTH })).toEqual([
      'household',
      'budget',
      'h/a',
      { periodStart: '2026-07-01', periodType: 'MONTH' },
    ]);
    expect(householdKeys.charts('h/a', {
      anchorDate: '2026-07-21',
      display: 'pie',
      metric: 'expense',
      period: 'month',
    })).toEqual([
      'household',
      'chart',
      'h/a',
      {
        anchorDate: '2026-07-21',
        display: 'pie',
        metric: 'expense',
        period: 'month',
      },
    ]);
    expect(householdKeys.calendar('h/a', '2026-07-01')).toEqual([
      'household',
      'calendar',
      'h/a',
      '2026-07-01',
    ]);
  });
});
