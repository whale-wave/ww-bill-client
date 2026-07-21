import type {
  PatchLedgerJoinRequestApiData,
  PatchLedgerMemberApiData,
  PostLedgerOwnershipTransferApiData,
} from '@/entities/ledger/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteLedgerInvitationApi,
  deleteLedgerMemberApi,
  getLedgerInvitationPreviewApi,
  getLedgerJoinRequestsApi,
  getLedgerMembersApi,
  getMyLedgerJoinRequestsApi,
  patchLedgerJoinRequestApi,
  patchLedgerMemberApi,
  postLeaveLedgerApi,
  postLedgerInvitationApi,
  postLedgerJoinRequestApi,
  postLedgerOwnershipTransferApi,
} from '@/entities/ledger/api';
import {
  LedgerJoinDecision,
  LedgerMemberStatus,
  LedgerRole,
} from '@/entities/ledger/types';

const request = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/api', () => ({ request }));

describe('ledger collaboration api', () => {
  beforeEach(() => Object.values(request).forEach(mock => mock.mockReset()));

  it('creates and revokes invitations with URL-safe identifiers', () => {
    const data = { idempotencyKey: 'invite-1', sharingConsentConfirmed: true as const };
    postLedgerInvitationApi('ledger/a b', data);
    deleteLedgerInvitationApi('ledger/a b', 'invite/a b');

    expect(request.post).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/invitations',
      data,
    );
    expect(request.delete).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/invitations/invite%2Fa%20b',
    );
  });

  it('previews and consumes a URL-safe invitation code', () => {
    const data = { idempotencyKey: 'join-1', remark: '我是小勇' };
    getLedgerInvitationPreviewApi('AB/C D');
    postLedgerJoinRequestApi('AB/C D', data);

    expect(request.get).toHaveBeenCalledWith('/ledger-invitations/AB%2FC%20D');
    expect(request.post).toHaveBeenCalledWith(
      '/ledger-invitations/AB%2FC%20D/join-requests',
      data,
    );
  });

  it('lists and decides join requests without reshaping optimistic versions', () => {
    const data: PatchLedgerJoinRequestApiData = {
      assignedRole: LedgerRole.BOOKKEEPER,
      decision: LedgerJoinDecision.APPROVED,
      decisionRemark: '欢迎加入',
      version: 2,
    };
    getMyLedgerJoinRequestsApi();
    getLedgerJoinRequestsApi('ledger/a b');
    patchLedgerJoinRequestApi('ledger/a b', 'request/a b', data);

    expect(request.get).toHaveBeenCalledWith('/ledger-join-requests/mine');
    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/join-requests');
    expect(request.patch).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/join-requests/request%2Fa%20b',
      data,
    );
  });

  it('lists active members and updates role or nickname with a version', () => {
    const params = { status: LedgerMemberStatus.ACTIVE };
    const data: PatchLedgerMemberApiData = {
      nickname: '小勇',
      role: LedgerRole.VIEWER,
      version: 4,
    };
    getLedgerMembersApi('ledger/a b', params);
    patchLedgerMemberApi('ledger/a b', 'member/a b', data);

    expect(request.get).toHaveBeenCalledWith('/ledgers/ledger%2Fa%20b/members', {
      params,
    });
    expect(request.patch).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/members/member%2Fa%20b',
      data,
    );
  });

  it('removes, leaves, and transfers ownership with optimistic versions', () => {
    const transfer: PostLedgerOwnershipTransferApiData = {
      ownerVersion: 3,
      targetMemberId: 'member/a b',
      targetVersion: 4,
    };

    deleteLedgerMemberApi('ledger/a b', 'member/a b', 4);
    postLeaveLedgerApi('ledger/a b', { version: 3 });
    postLedgerOwnershipTransferApi('ledger/a b', transfer);

    expect(request.delete).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/members/member%2Fa%20b',
      { params: { version: 4 } },
    );
    expect(request.post).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/leave',
      { version: 3 },
    );
    expect(request.post).toHaveBeenCalledWith(
      '/ledgers/ledger%2Fa%20b/ownership-transfer',
      transfer,
    );
  });
});
