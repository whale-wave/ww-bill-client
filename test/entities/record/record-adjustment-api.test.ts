import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteLedgerRecordAdjustmentApi,
  deleteRecordAdjustmentApi,
  postLedgerRecordAdjustmentApi,
  postRecordAdjustmentApi,
  putLedgerRecordAdjustmentApi,
  putRecordAdjustmentApi,
} from '@/entities/record/api';

const request = vi.hoisted(() => ({
  delete: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('@/shared/api', () => ({ request }));

describe('record adjustment api', () => {
  beforeEach(() => Object.values(request).forEach(mock => mock.mockReset()));

  it('uses the personal-record routes for create, update, and delete', () => {
    const data = {
      amount: '20.00',
      occurredAt: '2026-09-08T10:00:00.000Z',
      remark: '部分退款',
      type: 'refund' as const,
    };

    postRecordAdjustmentApi('record/a b', data);
    putRecordAdjustmentApi('record/a b', 'adjustment/a b', { ...data, version: 2 });
    deleteRecordAdjustmentApi('record/a b', 'adjustment/a b', 3);

    expect(request.post).toHaveBeenCalledWith('/record/record%2Fa%20b/adjustments', data);
    expect(request.put).toHaveBeenCalledWith(
      '/record/record%2Fa%20b/adjustments/adjustment%2Fa%20b',
      { ...data, version: 2 },
    );
    expect(request.delete).toHaveBeenCalledWith(
      '/record/record%2Fa%20b/adjustments/adjustment%2Fa%20b',
      { params: { version: 3 } },
    );
  });

  it('uses URL-safe ledger-scoped routes without reshaping the payload', () => {
    const data = {
      amount: '8.50',
      linkedAssetId: null,
      occurredAt: '2026-09-08T11:00:00.000Z',
      type: 'cashback' as const,
    };

    postLedgerRecordAdjustmentApi('ledger/a b', 'record/a b', data);
    putLedgerRecordAdjustmentApi('ledger/a b', 'record/a b', 'adjustment/a b', { version: 1 });
    deleteLedgerRecordAdjustmentApi('ledger/a b', 'record/a b', 'adjustment/a b', 2);

    const path = '/ledgers/ledger%2Fa%20b/records/record%2Fa%20b/adjustments';
    expect(request.post).toHaveBeenCalledWith(path, data);
    expect(request.put).toHaveBeenCalledWith(`${path}/adjustment%2Fa%20b`, { version: 1 });
    expect(request.delete).toHaveBeenCalledWith(`${path}/adjustment%2Fa%20b`, {
      params: { version: 2 },
    });
  });
});
