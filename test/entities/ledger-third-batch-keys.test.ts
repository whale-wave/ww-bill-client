import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { budgetKeys } from '@/entities/budget';
import { categoryKeys } from '@/entities/category';
import { chartKeys } from '@/entities/chart';
import { ledgerKeys } from '@/entities/ledger';
import { ledgerDataKeys } from '@/entities/ledger-data';
import {
  invalidateLedgerRecordCountCache,
  invalidateLedgerRestoreCaches,
  invalidateLedgerTransferCaches,
} from '@/entities/ledger-data/hooks';
import { recordKeys } from '@/entities/record';
import { invalidateRecordCountNavigationCache } from '@/entities/record/hooks';

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

  it('invalidates navigation when a record count changes', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ledgerKeys.navigation(), { data: [] });

    await invalidateLedgerRecordCountCache(queryClient);

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
  });

  it('invalidates navigation for personal and custom record mutations', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ledgerKeys.navigation(), { data: [] });

    await invalidateRecordCountNavigationCache(queryClient);

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
  });

  it('invalidates personal and scoped record roots when restoring a record', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ledgerKeys.navigation(), { data: [] });
    queryClient.setQueryData(recordKeys.list(), { data: [] });
    queryClient.setQueryData(recordKeys.ledgerRoot('ledger-a'), { data: [] });

    await invalidateLedgerRestoreCaches(queryClient, 'ledger-a');

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.ledgerRoot('ledger-a'))?.isInvalidated)
      .toBe(true);
  });

  it.each([
    ['personal to custom', 'system-default', 'ledger-b'],
    ['custom to personal', 'ledger-a', 'system-default'],
    ['custom to custom', 'ledger-a', 'ledger-b'],
  ])('invalidates navigation and both record roots for %s transfer', async (
    _name,
    sourceLedgerId,
    targetLedgerId,
  ) => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ledgerKeys.navigation(), { data: [] });
    queryClient.setQueryData(recordKeys.list(), { data: [] });
    queryClient.setQueryData(recordKeys.ledgerRoot(sourceLedgerId), { data: [] });
    queryClient.setQueryData(recordKeys.ledgerRoot(targetLedgerId), { data: [] });

    await invalidateLedgerTransferCaches(queryClient, {
      sourceLedgerId,
      targetLedgerId,
    });

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(recordKeys.ledgerRoot(sourceLedgerId))?.isInvalidated)
      .toBe(true);
    expect(queryClient.getQueryState(recordKeys.ledgerRoot(targetLedgerId))?.isInvalidated)
      .toBe(true);
  });
});
