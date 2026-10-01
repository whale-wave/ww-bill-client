import { formatRecordOriginalAmount } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';

describe('shared original record amount presentation', () => {
  it('uses an expense sign and normalizes trailing fractional zeros', () => {
    expect(formatRecordOriginalAmount('sub', '35.50')).toBe('-35.5');
  });

  it('keeps income positive without converting a large decimal to Number', () => {
    expect(formatRecordOriginalAmount('add', '9007199254740993.10')).toBe('9007199254740993.1');
  });

  it.each([undefined, null, '', 0])('omits an absent original amount %s', (amount) => {
    expect(formatRecordOriginalAmount('sub', amount)).toBeUndefined();
  });

  it('preserves an explicitly supplied zero string', () => {
    expect(formatRecordOriginalAmount('add', '0.00')).toBe('0');
  });
});
