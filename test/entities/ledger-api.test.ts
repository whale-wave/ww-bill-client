import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getLedgerApi,
  getLedgerManagementApi,
  getLedgersApi,
  getLedgerTemplatesApi,
  patchLedgerApi,
  patchLedgerManagementOrderApi,
  postLedgerApi,
} from '@/entities/ledger/api';
import { LedgerStatus } from '@/entities/ledger/types';

const { get, patch, post } = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  request: { get, patch, post },
}));

describe('ledger api', () => {
  beforeEach(() => {
    get.mockReset();
    patch.mockReset();
    post.mockReset();
  });

  it('requests the ledger list with filters', () => {
    const params = { status: LedgerStatus.ACTIVE };

    getLedgersApi(params);

    expect(get).toHaveBeenCalledWith('/ledgers', { params });
  });

  it('requests the template catalog', () => {
    getLedgerTemplatesApi();

    expect(get).toHaveBeenCalledWith('/ledgers/templates');
  });

  it('requests the dedicated ledger management list', () => {
    getLedgerManagementApi();

    expect(get).toHaveBeenCalledWith('/ledgers/management');
  });

  it('patches ledger order without reshaping member versions', () => {
    const data = {
      items: [
        { ledgerId: 'ledger/a b', memberVersion: 3 },
        { ledgerId: 'ledger-2', memberVersion: 8 },
      ],
    };

    patchLedgerManagementOrderApi(data);

    expect(patch).toHaveBeenCalledWith('/ledgers/management/order', data);
  });

  it('encodes the ledger id in detail and update urls', () => {
    getLedgerApi('ledger/a b');
    patchLedgerApi('ledger/a b', { name: '新账本', version: 3 });

    expect(get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b');
    expect(patch).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b', {
      name: '新账本',
      version: 3,
    });
  });

  it('posts the create contract without reshaping it', () => {
    const data = {
      monthStartDay: 1,
      name: '旅行账本',
      templateKey: 'business' as const,
      templateVersion: 1 as const,
    };

    postLedgerApi(data);

    expect(post).toHaveBeenCalledWith('/ledgers', data);
  });
});
