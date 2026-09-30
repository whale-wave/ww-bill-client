import type { RecordPage } from '../../miniapp/src/entities/record/api';
import { describe, expect, it } from 'vitest';
import { nextRecordPageOffset } from '../../miniapp/src/entities/record/paging';

function page(total: number, count: number): RecordPage {
  return { total, data: Array.from({ length: count }, (_, id) => ({ id })) as RecordPage['data'], expend: 0, income: 0 };
}

describe('miniapp record paging', () => {
  it('stops on an empty month or an empty follow-up page', () => {
    expect(nextRecordPageOffset(page(0, 0), [page(0, 0)])).toBeUndefined();
    expect(nextRecordPageOffset(page(10, 0), [page(10, 5), page(10, 0)])).toBeUndefined();
  });

  it('continues from the number of loaded records and stops at total', () => {
    const firstPage = page(4, 2);
    const secondPage = page(4, 2);
    expect(nextRecordPageOffset(firstPage, [firstPage])).toBe(2);
    expect(nextRecordPageOffset(secondPage, [firstPage, secondPage])).toBeUndefined();
  });
});
