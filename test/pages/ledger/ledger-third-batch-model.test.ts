import { describe, expect, it } from 'vitest';
import { LedgerChartMetric } from '@/entities/ledger';
import {
  getLedgerChartQueryTypes,
  getLedgerChartTotal,
} from '@/pages/ledger-charts/model';
import {
  buildLedgerTransferRequest,
  groupLedgerTransferConflicts,
} from '@/pages/ledger-transfer/model';

describe('ledger charts compatibility model', () => {
  it('maps expense/income to one canonical request and net to two requests', () => {
    expect(getLedgerChartQueryTypes(LedgerChartMetric.EXPENSE)).toEqual(['sub']);
    expect(getLedgerChartQueryTypes(LedgerChartMetric.INCOME)).toEqual(['add']);
    expect(getLedgerChartQueryTypes(LedgerChartMetric.NET)).toEqual(['add', 'sub']);
  });

  it('aggregates a net total without pretending a net category ranking exists', () => {
    expect(getLedgerChartTotal(LedgerChartMetric.NET, 1200, 800)).toBe(400);
    expect(getLedgerChartTotal(LedgerChartMetric.EXPENSE, 1200, 800)).toBe(800);
  });
});

describe('physical ledger transfer model', () => {
  it('builds an explicit ledger A to B physical move request', () => {
    expect(buildLedgerTransferRequest({
      categoryMappings: { 1: 8 },
      idempotencyKey: 'transfer-1',
      recordIds: [9],
      sourceLedgerId: 'ledger/a',
      tagMappings: { 'tag/a': 'tag/b' },
      tagStrategy: 'map',
      targetLedgerId: 'ledger/b',
    })).toEqual({
      categoryMappings: { 1: 8 },
      idempotencyKey: 'transfer-1',
      recordIds: [9],
      sourceLedgerId: 'ledger/a',
      tagMappings: { 'tag/a': 'tag/b' },
      tagStrategy: 'map',
      targetLedgerId: 'ledger/b',
    });
  });

  it('groups preview conflicts by record for actionable mapping feedback', () => {
    expect(groupLedgerTransferConflicts([
      { code: 'CATEGORY_MAPPING_MISSING', message: '缺少分类映射', recordId: 9, sourceCategoryId: 1 },
      { code: 'TAG_MAPPING_MISSING', message: '缺少标签映射', recordId: 9, sourceTagId: 'tag/a' },
      { code: 'RECORD_DELETED', message: '记录已删除', recordId: 10 },
    ])).toEqual([
      { conflicts: expect.arrayContaining([expect.objectContaining({ code: 'CATEGORY_MAPPING_MISSING' }), expect.objectContaining({ code: 'TAG_MAPPING_MISSING' })]), recordId: 9 },
      { conflicts: [expect.objectContaining({ code: 'RECORD_DELETED' })], recordId: 10 },
    ]);
  });
});
