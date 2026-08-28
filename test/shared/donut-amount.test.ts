import { describe, expect, it } from 'vitest';
import { getDonutAmountSize } from '@/shared/lib';

describe('getDonutAmountSize', () => {
  it.each([
    ['¥90.00', 17],
    ['¥1,234.56', 14],
    ['¥1,234,567.89', 11],
    ['-¥1,234,567.89', 11],
  ])('sizes the final displayed amount %s as %spx', (amount, expected) => {
    expect(getDonutAmountSize(amount)).toBe(expected);
  });
});
