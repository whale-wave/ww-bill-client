import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteLedgerBudgetCategoryApi,
  getLedgerBudgetInfoApi,
  patchLedgerBudgetAmountApi,
  postLedgerBudgetSummaryApi,
} from '@/entities/budget/api';
import {
  deleteLedgerCategoryApi,
  getCategoryIconCatalogApi,
  getLedgerCategoriesApi,
  patchLedgerCategoryApi,
  putLedgerCategoryApi,
  reorderLedgerCategoriesApi,
  uploadLedgerCategoryIconApi,
} from '@/entities/category/api';
import { getLedgerChartApi } from '@/entities/chart/api';
import {
  deleteLedgerTagApi,
  downloadLedgerExportApi,
  getLedgerExportTaskApi,
  getLedgerRecoveryRecordsApi,
  getLedgerTagsApi,
  patchLedgerTagApi,
  postLedgerExportApi,
  postLedgerRestoreRecordApi,
  postLedgerTransferExecuteApi,
  postLedgerTransferPreviewApi,
} from '@/entities/ledger-data/api';
import {
  getLedgerPreferencesApi,
  patchLedgerPreferencesApi,
  postArchiveLedgerApi,
} from '@/entities/ledger/api';
import { deleteLedgerRecordApi, getLedgerRecordBillApi, getLedgerRecordByIdApi, getLedgerRecordsApi, postLedgerRecordApi, putLedgerRecordApi } from '@/entities/record/api';

const request = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('@/shared/api', () => ({ request }));

describe('ledger third-batch canonical APIs', () => {
  beforeEach(() => Object.values(request).forEach(mock => mock.mockReset()));

  it('encodes ledger preferences and archive routes without reshaping versions', () => {
    getLedgerPreferencesApi('ledger/a b');
    patchLedgerPreferencesApi('ledger/a b', {
      hideTotalAmount: true,
      version: 3,
    });
    postArchiveLedgerApi('ledger/a b', {
      confirmed: true,
      reason: '不再使用',
      version: 7,
    });

    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/preferences');
    expect(request.patch).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/preferences', {
      hideTotalAmount: true,
      version: 3,
    });
    expect(request.post).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/archive', {
      confirmed: true,
      reason: '不再使用',
      version: 7,
    });
  });

  it('keeps record, category, budget and chart requests scoped to the URL ledger', () => {
    getLedgerRecordsApi('ledger/a b', { keyword: '餐' });
    getLedgerRecordByIdApi('ledger/a b', '9/1');
    postLedgerRecordApi('ledger/a b', { amount: '12', categoryId: 8, remark: '午餐', time: '2026-07-21', type: 'sub' });
    putLedgerRecordApi('ledger/a b', '9/1', { remark: '晚餐', version: 3 });
    deleteLedgerRecordApi('ledger/a b', '9/1', 3);
    getLedgerRecordBillApi('ledger/a b', { type: 'year', year: 2026 });
    getLedgerCategoriesApi('ledger/a b', { type: 'sub' });
    putLedgerCategoryApi('ledger/a b', 8, { name: '聚餐' });
    deleteLedgerCategoryApi('ledger/a b', 8);
    getLedgerBudgetInfoApi('ledger/a b', { periodStart: '2026-07-01', type: 0 });
    postLedgerBudgetSummaryApi('ledger/a b', { amount: '1000', periodStart: '2026-07-01', type: 0 });
    patchLedgerBudgetAmountApi('ledger/a b', 'budget/a', { amount: '1200', periodStart: '2026-07-01', type: 0 });
    deleteLedgerBudgetCategoryApi('ledger/a b', 'budget/a', { periodStart: '2026-07-01', type: 0 });
    getLedgerChartApi('ledger/a b', { category: 'month', type: 'sub' });

    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/records', { params: { keyword: '餐' } });
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/records/9%2F1');
    expect(request.post).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/records', { amount: '12', categoryId: 8, remark: '午餐', time: '2026-07-21', type: 'sub' });
    expect(request.put).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/records/9%2F1', { remark: '晚餐', version: 3 });
    expect(request.delete).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/records/9%2F1', { params: { version: 3 } });
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/records/bill', { params: { type: 'year', year: 2026 } });
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/categories', { params: { type: 'sub' } });
    expect(request.put).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/categories/8', { name: '聚餐' });
    expect(request.delete).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/categories/8');
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/budgets/info', { params: { periodStart: '2026-07-01', type: 0 } });
    expect(request.post).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/budgets/summary', { amount: '1000', periodStart: '2026-07-01', type: 0 });
    expect(request.patch).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/budgets/budget%2Fa/amount', { amount: '1200', periodStart: '2026-07-01', type: 0 });
    expect(request.delete).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/budgets/category/budget%2Fa', { data: { periodStart: '2026-07-01', type: 0 } });
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/charts', { params: { category: 'month', type: 'sub' } });
  });

  it('uses versioned category catalog, patch, order, and image routes', () => {
    getCategoryIconCatalogApi();
    getLedgerCategoriesApi('ledger/a b', { status: 'ALL', type: 'sub' });
    patchLedgerCategoryApi('ledger/a b', 8, { status: 'ARCHIVED', version: 3 });
    reorderLedgerCategoriesApi('ledger/a b', {
      items: [{ categoryId: 8, version: 3 }],
      type: 'sub',
    });
    uploadLedgerCategoryIconApi(
      'ledger/a b',
      8,
      new File(['image'], 'icon.webp', { type: 'image/webp' }),
      4,
    );
    deleteLedgerCategoryApi('ledger/a b', 8, 5);

    expect(request.get).toHaveBeenCalledWith('/category/icon-catalog');
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/categories', {
      params: { status: 'ALL', type: 'sub' },
    });
    expect(request.patch).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/categories/8', {
      status: 'ARCHIVED',
      version: 3,
    });
    expect(request.patch).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/categories/order', {
      items: [{ categoryId: 8, version: 3 }],
      type: 'sub',
    });
    const upload = request.post.mock.calls.find(call => String(call[0]).endsWith('/categories/8/icon'));
    expect(upload?.[0]).toBe('/ledgers/ledger%2Fa%20b/categories/8/icon');
    expect(upload?.[1]).toBeInstanceOf(FormData);
    expect((upload?.[1] as FormData).get('version')).toBe('4');
    expect(request.delete).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/categories/8',
      { params: { version: 5 } },
    );
  });

  it('uses canonical tag, recovery, physical transfer and export routes', () => {
    getLedgerTagsApi('ledger/a b', { status: 'ACTIVE' });
    patchLedgerTagApi('ledger/a b', 'tag/a', { name: '聚餐', version: 2 });
    deleteLedgerTagApi('ledger/a b', 'tag/a', { version: 2 });
    getLedgerRecoveryRecordsApi('ledger/a b', { days: 30 });
    postLedgerRestoreRecordApi('ledger/a b', 9, { replacementCategoryId: 8, version: 4 });
    const transfer = {
      categoryMappings: { 1: 8 },
      idempotencyKey: 'transfer-1',
      recordIds: [9],
      sourceLedgerId: 'ledger/a',
      tagStrategy: 'drop' as const,
      targetLedgerId: 'ledger/b',
    };
    postLedgerTransferPreviewApi(transfer);
    postLedgerTransferExecuteApi(transfer);
    postLedgerExportApi('ledger/a b', {
      filters: { type: 'sub' },
      format: 'csv',
      idempotencyKey: 'export-1',
    });
    getLedgerExportTaskApi('ledger/a b', 'task/a');
    downloadLedgerExportApi('ledger/a b', 'task/a');

    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/tags', { params: { status: 'ACTIVE' } });
    expect(request.patch).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/tags/tag%2Fa', { name: '聚餐', version: 2 });
    expect(request.delete).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/tags/tag%2Fa', { data: { version: 2 } });
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/recovery/records', { params: { days: 30 } });
    expect(request.post).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/recovery/records/9', { replacementCategoryId: 8, version: 4 });
    expect(request.post).toHaveBeenCalledWith('/ledger-transfers/preview', transfer);
    expect(request.post).toHaveBeenCalledWith('/ledger-transfers/execute', transfer);
    expect(request.post).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/exports', {
      filters: { type: 'sub' },
      format: 'csv',
      idempotencyKey: 'export-1',
    });
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/exports/task%2Fa');
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/exports/task%2Fa/download', { responseType: 'blob' });
  });
});
