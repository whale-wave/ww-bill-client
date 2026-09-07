import { describe, expect, it } from 'vitest';
import {
  flattenRecordPages,
  getNextRecordOffset,
} from '@/entities/record';

describe('record query pagination', () => {
  it('continues from the number of records actually received', () => {
    expect(getNextRecordOffset({
      data: Array.from({ length: 30 }, () => ({} as never)),
      offset: 0,
      total: 61,
    })).toBe(30);
    expect(getNextRecordOffset({
      data: [{} as never],
      offset: 60,
      total: 61,
    })).toBeUndefined();
  });

  it('deduplicates records when adjacent pages overlap', () => {
    expect(flattenRecordPages([
      { data: { data: [{ id: 1 }, { id: 2 }] } },
      { data: { data: [{ id: 2 }, { id: 3 }] } },
    ] as never)).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);
  });
});
