import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cacheCreatedLedgerResponse,
  cacheReorderedLedgerManagementResponse,
  createLedgerInvitationMutationFn,
  createLedgerMutationFn,
  decideLedgerJoinRequestMutationFn,
  getLedgerInvitationPreviewQueryFn,
  getLedgerJoinRequestsQueryFn,
  getLedgerManagementQueryFn,
  getLedgerMembersQueryFn,
  getLedgerQueryFn,
  getLedgersQueryFn,
  getLedgerTemplatesQueryFn,
  getMyLedgerJoinRequestsQueryFn,
  invalidateLedgerNavigationAndManagementCaches,
  reorderLedgersMutationFn,
  revokeLedgerInvitationMutationFn,
  submitLedgerJoinRequestMutationFn,
  updateLedgerMemberMutationFn,
  updateLedgerMutationFn,
} from '@/entities/ledger/hooks';
import { ledgerKeys } from '@/entities/ledger/keys';
import {
  LedgerJoinDecision,
  LedgerMemberStatus,
  LedgerStatus,
} from '@/entities/ledger/types';

const api = vi.hoisted(() => ({
  getLedgerApi: vi.fn(),
  getLedgerInvitationPreviewApi: vi.fn(),
  getLedgerJoinRequestsApi: vi.fn(),
  getLedgerMembersApi: vi.fn(),
  getLedgerManagementApi: vi.fn(),
  getLedgersApi: vi.fn(),
  getLedgerTemplatesApi: vi.fn(),
  getMyLedgerJoinRequestsApi: vi.fn(),
  deleteLedgerInvitationApi: vi.fn(),
  patchLedgerJoinRequestApi: vi.fn(),
  patchLedgerMemberApi: vi.fn(),
  patchLedgerManagementOrderApi: vi.fn(),
  patchLedgerApi: vi.fn(),
  postLedgerInvitationApi: vi.fn(),
  postLedgerJoinRequestApi: vi.fn(),
  postLedgerApi: vi.fn(),
}));

vi.mock('@/entities/ledger/api', () => api);

const failedEnvelope = {
  data: null,
  message: '没有权限',
  statusCode: 400,
};

describe('ledger React Query functions', () => {
  beforeEach(() => {
    Object.values(api).forEach(mock => mock.mockReset());
  });

  it.each([
    ['list query', () => {
      api.getLedgersApi.mockResolvedValue(failedEnvelope);
      return getLedgersQueryFn({ status: LedgerStatus.ACTIVE });
    }],
    ['template query', () => {
      api.getLedgerTemplatesApi.mockResolvedValue(failedEnvelope);
      return getLedgerTemplatesQueryFn();
    }],
    ['detail query', () => {
      api.getLedgerApi.mockResolvedValue(failedEnvelope);
      return getLedgerQueryFn('ledger-1');
    }],
    ['create mutation', () => {
      api.postLedgerApi.mockResolvedValue(failedEnvelope);
      return createLedgerMutationFn({
        monthStartDay: 1,
        name: '旅行账本',
        templateKey: 'business',
        templateVersion: 1,
      });
    }],
    ['update mutation', () => {
      api.patchLedgerApi.mockResolvedValue(failedEnvelope);
      return updateLedgerMutationFn({
        data: { name: '旅行账本', version: 1 },
        ledgerId: 'ledger-1',
      });
    }],
    ['invitation preview', () => {
      api.getLedgerInvitationPreviewApi.mockResolvedValue(failedEnvelope);
      return getLedgerInvitationPreviewQueryFn('CODE');
    }],
    ['my join requests', () => {
      api.getMyLedgerJoinRequestsApi.mockResolvedValue(failedEnvelope);
      return getMyLedgerJoinRequestsQueryFn();
    }],
    ['ledger join requests', () => {
      api.getLedgerJoinRequestsApi.mockResolvedValue(failedEnvelope);
      return getLedgerJoinRequestsQueryFn('ledger-1');
    }],
    ['ledger members', () => {
      api.getLedgerMembersApi.mockResolvedValue(failedEnvelope);
      return getLedgerMembersQueryFn('ledger-1', { status: LedgerMemberStatus.ACTIVE });
    }],
    ['management list', () => {
      api.getLedgerManagementApi.mockResolvedValue(failedEnvelope);
      return getLedgerManagementQueryFn();
    }],
    ['reorder ledgers', () => {
      api.patchLedgerManagementOrderApi.mockResolvedValue(failedEnvelope);
      return reorderLedgersMutationFn({
        items: [{ ledgerId: 'ledger-1', memberVersion: 2 }],
      });
    }],
    ['create invitation', () => {
      api.postLedgerInvitationApi.mockResolvedValue(failedEnvelope);
      return createLedgerInvitationMutationFn({
        data: { sharingConsentConfirmed: true },
        ledgerId: 'ledger-1',
      });
    }],
    ['revoke invitation', () => {
      api.deleteLedgerInvitationApi.mockResolvedValue(failedEnvelope);
      return revokeLedgerInvitationMutationFn({
        invitationId: 'invite-1',
        ledgerId: 'ledger-1',
      });
    }],
    ['submit join request', () => {
      api.postLedgerJoinRequestApi.mockResolvedValue(failedEnvelope);
      return submitLedgerJoinRequestMutationFn({
        code: 'CODE',
        data: { remark: '我是小勇' },
      });
    }],
    ['decide join request', () => {
      api.patchLedgerJoinRequestApi.mockResolvedValue(failedEnvelope);
      return decideLedgerJoinRequestMutationFn({
        data: { decision: LedgerJoinDecision.IGNORED, version: 1 },
        ledgerId: 'ledger-1',
        requestId: 'request-1',
      });
    }],
    ['update member', () => {
      api.patchLedgerMemberApi.mockResolvedValue(failedEnvelope);
      return updateLedgerMemberMutationFn({
        data: { nickname: '小勇', version: 1 },
        ledgerId: 'ledger-1',
        memberId: 'member-1',
      });
    }],
  ])('rejects a failed business envelope in the %s', async (_name, execute) => {
    await expect(execute()).rejects.toMatchObject({
      data: null,
      message: '没有权限',
      statusCode: 400,
    });
  });

  it('preserves the successful envelope for hook consumers', async () => {
    const response = {
      data: [],
      message: '成功',
      statusCode: 200,
    };
    api.getLedgersApi.mockResolvedValue(response);

    await expect(getLedgersQueryFn()).resolves.toBe(response);
  });

  it('writes a created ledger detail before invalidating ledger lists', async () => {
    const queryClient = new QueryClient();
    const listKey = ledgerKeys.list();
    const response = {
      data: { id: 'ledger-1' },
      message: '成功',
      statusCode: 200,
    };
    queryClient.setQueryData(listKey, { data: [] });

    await cacheCreatedLedgerResponse(queryClient, response);

    expect(queryClient.getQueryData(ledgerKeys.detail('ledger-1'))).toBe(response);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it('writes returned member versions into management cache and invalidates navigation', async () => {
    const queryClient = new QueryClient();
    const navigationKey = ledgerKeys.navigation();
    const managementResponse = {
      data: [
        {
          id: 'ledger-1',
          myMembership: { id: 'member-1', sortOrder: 9, version: 2 },
        },
        {
          id: 'ledger-2',
          myMembership: { id: 'member-2', sortOrder: 8, version: 5 },
        },
      ],
      message: '成功',
      statusCode: 200,
    };
    const reorderResponse = {
      data: [
        { ledgerId: 'ledger-2', memberVersion: 6, sortOrder: 0 },
        { ledgerId: 'ledger-1', memberVersion: 3, sortOrder: 1 },
      ],
      message: '成功',
      statusCode: 200,
    };
    queryClient.setQueryData(ledgerKeys.management(), managementResponse);
    queryClient.setQueryData(navigationKey, { data: [] });

    await cacheReorderedLedgerManagementResponse(queryClient, reorderResponse);

    expect(queryClient.getQueryData(ledgerKeys.management())).toEqual({
      ...managementResponse,
      data: [
        {
          id: 'ledger-2',
          myMembership: { id: 'member-2', sortOrder: 0, version: 6 },
        },
        {
          id: 'ledger-1',
          myMembership: { id: 'member-1', sortOrder: 1, version: 3 },
        },
      ],
    });
    expect(queryClient.getQueryState(navigationKey)?.isInvalidated).toBe(true);
  });

  it('invalidates navigation and management presentation caches separately', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(ledgerKeys.navigation(), { data: [] });
    queryClient.setQueryData(ledgerKeys.management(), { data: [] });

    await invalidateLedgerNavigationAndManagementCaches(queryClient);

    expect(queryClient.getQueryState(ledgerKeys.navigation())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(ledgerKeys.management())?.isInvalidated).toBe(true);
  });
});
