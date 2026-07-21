import { describe, expect, it } from 'vitest';
import { budgetKeys } from '@/entities/budget';
import { categoryKeys } from '@/entities/category';
import { chartKeys } from '@/entities/chart';
import { ledgerKeys } from '@/entities/ledger';
import { ledgerDataKeys } from '@/entities/ledger-data';
import { recordKeys } from '@/entities/record';

describe('ledger-scoped third-batch query keys', () => {
  it('isolates every resource by the decoded ledger id', () => {
    expect(ledgerKeys.preferences('ledger/a')).toEqual(['ledger', 'preference', 'ledger/a']);
    expect(recordKeys.ledgerList('ledger/a', { keyword: '餐' })).toEqual(['record', 'ledger', 'ledger/a', 'list', { keyword: '餐' }]);
    expect(recordKeys.ledgerDetail('ledger/a', '9')).toEqual(['record', 'ledger', 'ledger/a', 'detail', '9']);
    expect(recordKeys.ledgerBill('ledger/a', { type: 'year', year: 2026 })).toEqual(['record', 'ledger', 'ledger/a', 'bill', { type: 'year', year: 2026 }]);
    expect(categoryKeys.ledgerList('ledger/a', { type: 'sub' })).toEqual(['category', 'ledger', 'ledger/a', 'list', { type: 'sub' }]);
    expect(budgetKeys.ledgerInfo('ledger/a', { periodStart: '2026-07-01', type: 0 })).toEqual(['budget', 'ledger', 'ledger/a', 'info', { periodStart: '2026-07-01', type: 0 }]);
    expect(chartKeys.ledgerList('ledger/a', { category: 'month', type: 'sub' })).toEqual(['chart', 'ledger', 'ledger/a', 'list', { category: 'month', type: 'sub' }]);
    expect(ledgerDataKeys.tags('ledger/a', 'ACTIVE')).toEqual(['ledger-data', 'tag', 'ledger/a', 'ACTIVE']);
    expect(ledgerDataKeys.recovery('ledger/a', 30)).toEqual(['ledger-data', 'recovery', 'ledger/a', 30]);
    expect(ledgerDataKeys.exportTask('ledger/a', 'task/a')).toEqual(['ledger-data', 'export', 'ledger/a', 'task/a']);
  });
});
