import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatAmountWithoutTrailingZeros,
  formatCompactAmount,
  money,
  normalizeAmount,
} from '@/shared/lib/amount';

describe('amount helpers', () => {
  it('keeps arithmetic and output behind one money facade', () => {
    expect(money.add('0.1', '0.2')).toBe('0.3');
    expect(money.compare('5848.19', '5848.18')).toBeGreaterThan(0);
    expect(money.format('5848.1900000000000006')).toBe('5848.19');
    expect(money.formatNatural('100.00')).toBe('100');
  });

  it('formats amounts to two decimal places', () => {
    expect(formatAmount(12)).toBe('12.00');
    expect(formatAmount(12.345)).toBe('12.35');
  });

  it('formats persisted floating-point tails as a natural currency amount', () => {
    expect(formatAmountWithoutTrailingZeros('2.7000000000000006')).toBe('2.7');
    expect(formatAmountWithoutTrailingZeros('196.95000000000002')).toBe('196.95');
    expect(formatAmountWithoutTrailingZeros('223.00000000000001')).toBe('223');
  });

  it('uses a compact 万 unit for large metric-card values', () => {
    expect(formatCompactAmount(74000)).toBe('7.4万');
    expect(formatCompactAmount(-865090)).toBe('-86.5万');
    expect(formatCompactAmount(13.5)).toBe('13.50');
  });

  it('normalizes leading decimal input', () => {
    expect(normalizeAmount('.', '')).toBe('0.');
  });

  it('rejects a second decimal point and excess precision', () => {
    expect(normalizeAmount('1.2.3', '1.2')).toBe('1.2');
    expect(normalizeAmount('1.234', '1.23')).toBe('1.23');
  });

  it('removes non-numeric characters and redundant leading zeroes', () => {
    expect(normalizeAmount('abc12.3', '')).toBe('12.3');
    expect(normalizeAmount('00012', '')).toBe('12');
  });
});
