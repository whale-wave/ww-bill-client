import { groupRecordsByKey, sumRecordAmounts } from '@ww-bill/bill-core';
import { describe, expect, it } from 'vitest';

describe('shared record grouping', () => {
  it('preserves first-seen group order and input order without changing the input', () => {
    const records = Object.freeze([
      Object.freeze({ day: '30', id: 1 }),
      Object.freeze({ day: '29', id: 2 }),
      Object.freeze({ day: '30', id: 3 }),
    ]);
    expect(Array.from(groupRecordsByKey(records, record => record.day))).toEqual([
      ['30', [records[0], records[2]]],
      ['29', [records[1]]],
    ]);
    expect(records.map(record => record.id)).toEqual([1, 2, 3]);
  });

  it('sums income and expense independently with decimal precision', () => {
    expect(sumRecordAmounts([
      { type: 'add', amount: '0.1' },
      { type: 'add', amount: 0.2 },
      { type: 'sub', amount: '10000000.01' },
      { type: 'sub', amount: '0.09' },
      { type: 'other', amount: 99 },
    ])).toEqual({ income: '0.3', expense: '10000000.1' });
    expect(sumRecordAmounts([])).toEqual({ income: '0', expense: '0' });
  });
});
