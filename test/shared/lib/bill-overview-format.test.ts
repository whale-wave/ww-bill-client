import { formatBillOverviewAmount } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';

describe('shared bill overview amounts', () => {
  it('preserves Web number display and missing-data fallback', () => {
    expect(formatBillOverviewAmount()).toBe('¥0.00');
    expect(formatBillOverviewAmount(0)).toBe('¥0');
    expect(formatBillOverviewAmount(187.98)).toBe('¥187.98');
  });
  it('matches the Web display for string amounts returned to miniapp', () => {
    expect(formatBillOverviewAmount('0.00')).toBe(formatBillOverviewAmount(0));
    expect(formatBillOverviewAmount('100.00')).toBe('¥100');
    expect(formatBillOverviewAmount('-15499.26')).toBe('¥-15499.26');
  });
});
