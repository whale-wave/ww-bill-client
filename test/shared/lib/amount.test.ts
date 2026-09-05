import { describe, expect, it } from 'vitest';
import { formatAmount, formatCompactAmount, normalizeAmount } from '@/shared/lib/amount';

describe('amount helpers', () => {
  it('formats amounts to two decimal places', () => {
    expect(formatAmount(12)).toBe('12.00');
    expect(formatAmount(12.345)).toBe('12.35');
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
