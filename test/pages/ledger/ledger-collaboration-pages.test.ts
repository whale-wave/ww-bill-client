import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import LedgerInvitePage from '@/pages/ledger-invite/LedgerInvitePage';
import LedgerJoinRequestDetailPage from '@/pages/ledger-join-request-detail/LedgerJoinRequestDetailPage';
import LedgerJoinPage from '@/pages/ledger-join/LedgerJoinPage';
import LedgerMemberDetailPage from '@/pages/ledger-member-detail/LedgerMemberDetailPage';
import LedgerMembersPage from '@/pages/ledger-members/LedgerMembersPage';

const hooks = vi.hoisted(() => ({
  createInvitation: vi.fn(),
  decideJoinRequest: vi.fn(),
  removeMember: vi.fn(),
  revokeInvitation: vi.fn(),
  submitJoinRequest: vi.fn(),
  transferOwnership: vi.fn(),
  updateMember: vi.fn(),
  useCreateInvitationMutation: vi.fn(),
  useDecideJoinRequestMutation: vi.fn(),
  useLedgerJoinRequestsQuery: vi.fn(),
  useLedgerMembersQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useRemoveLedgerMemberMutation: vi.fn(),
  useRevokeInvitationMutation: vi.fn(),
  useSubmitJoinRequestMutation: vi.fn(),
  useTransferLedgerOwnershipMutation: vi.fn(),
  useUpdateLedgerMemberMutation: vi.fn(),
}));

const dialogConfirm = vi.hoisted(() => vi.fn());
const toastShow = vi.hoisted(() => vi.fn());

vi.mock('@/entities/ledger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/ledger')>();
  return {
    ...actual,
    useCreateInvitationMutation: hooks.useCreateInvitationMutation,
    useDecideJoinRequestMutation: hooks.useDecideJoinRequestMutation,
    useLedgerJoinRequestsQuery: hooks.useLedgerJoinRequestsQuery,
    useLedgerMembersQuery: hooks.useLedgerMembersQuery,
    useLedgerQuery: hooks.useLedgerQuery,
    useRemoveLedgerMemberMutation: hooks.useRemoveLedgerMemberMutation,
    useRevokeInvitationMutation: hooks.useRevokeInvitationMutation,
    useSubmitJoinRequestMutation: hooks.useSubmitJoinRequestMutation,
    useTransferLedgerOwnershipMutation: hooks.useTransferLedgerOwnershipMutation,
    useUpdateLedgerMemberMutation: hooks.useUpdateLedgerMemberMutation,
  };
});

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: () => ({ data: { id: 1 } }),
}));

vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  return { ...actual, Dialog: { confirm: dialogConfirm }, Toast: { show: toastShow } };
});

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const ledger = {
  capabilities: [LedgerCapability.MEMBER_INVITE],
  createdAt: '2026-07-21T00:00:00.000Z',
  createdByUserId: 1,
  iconKey: 'custom',
  id: 'ledger/a',
  kind: LedgerKind.CUSTOM,
  monthStartDay: 1,
  myRole: LedgerRole.OWNER,
  name: '共享账本',
  ownerUserId: 1,
  status: LedgerStatus.ACTIVE,
  themeKey: 'cyan',
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 1,
};

let cleanup: (() => void) | undefined;

function render(path: string, routePath: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([{ path: routePath, element }], {
    initialEntries: [path],
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return container;
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  dialogConfirm.mockReset();
  dialogConfirm.mockResolvedValue(true);
  toastShow.mockReset();
  localStorage.clear();
  hooks.useLedgerQuery.mockReturnValue({
    data: ledger,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useCreateInvitationMutation.mockReturnValue([
    hooks.createInvitation,
    { isLoading: false },
  ]);
  hooks.useRevokeInvitationMutation.mockReturnValue([
    hooks.revokeInvitation,
    { isLoading: false },
  ]);
  hooks.useSubmitJoinRequestMutation.mockReturnValue([
    hooks.submitJoinRequest,
    { isLoading: false },
  ]);
  hooks.useDecideJoinRequestMutation.mockReturnValue([
    hooks.decideJoinRequest,
    { isLoading: false },
  ]);
  hooks.useUpdateLedgerMemberMutation.mockReturnValue([
    hooks.updateMember,
    { isLoading: false },
  ]);
  hooks.useRemoveLedgerMemberMutation.mockReturnValue([
    hooks.removeMember,
    { isLoading: false },
  ]);
  hooks.useTransferLedgerOwnershipMutation.mockReturnValue([
    hooks.transferOwnership,
    { isLoading: false },
  ]);
  hooks.useLedgerJoinRequestsQuery.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useLedgerMembersQuery.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
});

describe('ledger reviewer and member editing pages', () => {
  it('requires an explicit assignable role and previews its permissions before approval', async () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [LedgerCapability.MEMBER_REVIEW],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerJoinRequestsQuery.mockReturnValue({
      data: [{
        applicant: { id: 2, name: '小勇' },
        applicantRemark: '我是小勇',
        createdAt: '2026-07-21T00:00:00.000Z',
        expiresAt: '2026-07-22T00:00:00.000Z',
        id: 'request/a',
        ledger: { iconKey: 'custom', id: 'ledger/a', name: '共享账本', themeKey: 'cyan' },
        status: 'PENDING',
        updatedAt: '2026-07-21T00:00:00.000Z',
        version: 4,
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.decideJoinRequest.mockResolvedValue({ data: {} });
    const container = render(
      '/ledgers/ledger%2Fa/join-requests/request%2Fa',
      '/ledgers/:ledgerId/join-requests/:requestId',
      createElement(LedgerJoinRequestDetailPage),
    );
    expect(container.textContent).toContain('小勇');
    expect(container.textContent).toContain('requestDetail.avatar');
    expect(container.textContent).toContain('requestDetail.remark');
    expect(container.textContent).toContain('我是小勇');
    expect(container.textContent).toContain('requestDetail.chooseRole');
    expect(container.querySelector<HTMLButtonElement>('[data-testid="join-request-approve"]')?.disabled)
      .toBe(true);
    expect(hooks.decideJoinRequest).not.toHaveBeenCalled();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="join-request-role-row"]')?.click();
    });
    expect(document.body.querySelector('[data-testid="join-request-role-popup"]')).not.toBeNull();
    expect(document.body.querySelector('[data-testid="join-request-role-ADMIN"]')).not.toBeNull();
    expect(document.body.querySelector('[data-testid="join-request-role-BOOKKEEPER"]')).not.toBeNull();
    expect(document.body.querySelector('[data-testid="join-request-role-VIEWER"]')).not.toBeNull();

    await act(async () => {
      document.body.querySelector<HTMLButtonElement>('[data-testid="join-request-role-BOOKKEEPER"]')?.click();
    });
    expect(container.textContent).toContain('requestDetail.permissionsTitle');
    expect(container.textContent).toContain('requestDetail.permissions.browse.description');
    expect(container.textContent).toContain('requestDetail.permissions.records.description');
    expect(container.textContent).not.toContain('requestDetail.permissions.budget.description');
    expect(container.querySelector<HTMLButtonElement>('[data-testid="join-request-approve"]')?.disabled)
      .toBe(false);

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="join-request-approve"]')?.click();
      await Promise.resolve();
    });

    expect(hooks.decideJoinRequest).toHaveBeenCalledWith({
      data: {
        assignedRole: LedgerRole.BOOKKEEPER,
        decision: 'APPROVED',
        version: 4,
      },
      ledgerId: 'ledger/a',
      requestId: 'request/a',
    });
  });

  it('ignores a pending request without assigning a role', async () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [LedgerCapability.MEMBER_REVIEW],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerJoinRequestsQuery.mockReturnValue({
      data: [{
        applicant: { id: 2, name: '小勇' },
        applicantRemark: '我是小勇',
        createdAt: '2026-07-21T00:00:00.000Z',
        expiresAt: '2026-07-22T00:00:00.000Z',
        id: 'request/a',
        ledger: { iconKey: 'custom', id: 'ledger/a', name: '共享账本', themeKey: 'cyan' },
        status: 'PENDING',
        updatedAt: '2026-07-21T00:00:00.000Z',
        version: 5,
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.decideJoinRequest.mockResolvedValue({ data: {} });
    const container = render(
      '/ledgers/ledger%2Fa/join-requests/request%2Fa',
      '/ledgers/:ledgerId/join-requests/:requestId',
      createElement(LedgerJoinRequestDetailPage),
    );

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="join-request-ignore"]')?.click();
      await Promise.resolve();
    });

    expect(hooks.decideJoinRequest).toHaveBeenCalledWith({
      data: {
        decision: 'IGNORED',
        version: 5,
      },
      ledgerId: 'ledger/a',
      requestId: 'request/a',
    });
  });

  it('updates a member nickname with the member URL and current version', async () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [LedgerCapability.MEMBER_READ, LedgerCapability.MEMBER_MANAGE],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerMembersQuery.mockReturnValue({
      data: [{
        capabilities: [],
        id: 'member/a',
        joinedAt: '2026-07-21T00:00:00.000Z',
        nickname: '小勇',
        role: LedgerRole.BOOKKEEPER,
        status: 'ACTIVE',
        user: { id: 2, name: '小勇' },
        version: 3,
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.updateMember.mockResolvedValue({ data: {} });
    const container = render(
      '/ledgers/ledger%2Fa/members/member%2Fa',
      '/ledgers/:ledgerId/members/:memberId',
      createElement(LedgerMemberDetailPage),
    );
    const input = container.querySelector<HTMLInputElement>('#member-nickname');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      setter?.call(input, '小勇同学');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      container.querySelector('form')?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    expect(hooks.updateMember).toHaveBeenCalledWith({
      data: { nickname: '小勇同学', version: 3 },
      ledgerId: 'ledger/a',
      memberId: 'member/a',
    });
  });

  it('does not expose a self-nickname write while the ledger is suspended', () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [LedgerCapability.MEMBER_READ],
        status: LedgerStatus.SUSPENDED,
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerMembersQuery.mockReturnValue({
      data: [{
        capabilities: [],
        id: 'member/me',
        joinedAt: '2026-07-21T00:00:00.000Z',
        nickname: '我',
        role: LedgerRole.BOOKKEEPER,
        status: 'ACTIVE',
        user: { id: 1, name: '我' },
        version: 3,
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    const container = render(
      '/ledgers/ledger%2Fa/members/member%2Fme',
      '/ledgers/:ledgerId/members/:memberId',
      createElement(LedgerMemberDetailPage),
    );

    expect(container.querySelector<HTMLInputElement>('#member-nickname')?.disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')).toBeNull();
  });

  it('removes a manageable member with the current version', async () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [LedgerCapability.MEMBER_READ, LedgerCapability.MEMBER_MANAGE],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerMembersQuery.mockReturnValue({
      data: [{
        capabilities: [],
        id: 'member/a',
        joinedAt: '2026-07-21T00:00:00.000Z',
        nickname: '小勇',
        role: LedgerRole.BOOKKEEPER,
        status: 'ACTIVE',
        user: { id: 2, name: '小勇' },
        version: 4,
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.removeMember.mockResolvedValue({ data: {} });
    const container = render(
      '/ledgers/ledger%2Fa/members/member%2Fa',
      '/ledgers/:ledgerId/members/:memberId',
      createElement(LedgerMemberDetailPage),
    );

    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-member-remove"]')?.click());

    expect(hooks.removeMember).toHaveBeenCalledWith({ ledgerId: 'ledger/a', memberId: 'member/a', version: 4 });
  });

  it('transfers ownership using both member versions', async () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [LedgerCapability.MEMBER_READ, LedgerCapability.OWNERSHIP_TRANSFER],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerMembersQuery.mockReturnValue({
      data: [
        {
          capabilities: [],
          id: 'member/owner',
          joinedAt: '2026-07-21T00:00:00.000Z',
          nickname: '我',
          role: LedgerRole.OWNER,
          status: 'ACTIVE',
          user: { id: 1, name: '我' },
          version: 7,
        },
        {
          capabilities: [],
          id: 'member/a',
          joinedAt: '2026-07-21T00:00:00.000Z',
          nickname: '小勇',
          role: LedgerRole.ADMIN,
          status: 'ACTIVE',
          user: { id: 2, name: '小勇' },
          version: 4,
        },
      ],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.transferOwnership.mockResolvedValue({ data: {} });
    const container = render(
      '/ledgers/ledger%2Fa/members/member%2Fa',
      '/ledgers/:ledgerId/members/:memberId',
      createElement(LedgerMemberDetailPage),
    );

    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-ownership-transfer"]')?.click());

    expect(hooks.transferOwnership).toHaveBeenCalledWith({
      data: { ownerVersion: 7, targetMemberId: 'member/a', targetVersion: 4 },
      ledgerId: 'ledger/a',
    });
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger invitation page', () => {
  it('requires explicit sharing consent and prevents duplicate generation', async () => {
    let resolveInvite: ((value: unknown) => void) | undefined;
    hooks.createInvitation.mockReturnValue(new Promise(resolve => resolveInvite = resolve));
    const container = render(
      '/ledgers/ledger%2Fa/invites',
      '/ledgers/:ledgerId/invites',
      createElement(LedgerInvitePage),
    );
    const generate = container.querySelector<HTMLButtonElement>('[data-testid="generate-invitation"]');
    expect(generate?.disabled).toBe(true);

    await act(async () => {
      container.querySelector<HTMLElement>('[data-testid="invite-consent"]')?.click();
    });
    expect(generate?.disabled).toBe(false);

    await act(async () => {
      generate?.click();
      generate?.click();
      await Promise.resolve();
    });
    expect(hooks.createInvitation).toHaveBeenCalledOnce();
    expect(hooks.createInvitation).toHaveBeenCalledWith({
      data: expect.objectContaining({ sharingConsentConfirmed: true }),
      ledgerId: 'ledger/a',
    });

    await act(async () => resolveInvite?.({
      data: {
        code: 'ABC123',
        expiresAt: '2099-01-01T00:00:00.000Z',
        id: 'invite-1',
        ledgerId: 'ledger/a',
        status: 'ACTIVE',
        version: 1,
      },
      message: 'ok',
      statusCode: 201,
    }));
    expect(container.textContent).toContain('ABC123');
  });

  it('restores an unexpired invitation code from storage after a fresh mount', () => {
    localStorage.setItem('wh:ledger-invitation:ledger/a', JSON.stringify({
      schemaVersion: 1,
      ledgerId: 'ledger/a',
      id: 'invite-1',
      code: 'SAVED1',
      expiresAt: '2099-01-01T00:00:00.000Z',
      invitationVersion: 3,
    }));

    const container = render(
      '/ledgers/ledger%2Fa/invites',
      '/ledgers/:ledgerId/invites',
      createElement(LedgerInvitePage),
    );

    expect(container.querySelector('[data-testid="ledger-invite-code"]')?.textContent).toContain('SAVED1');
    expect(container.querySelector('[data-testid="generate-invitation"]')).toBeNull();
  });

  it('clears consent after a successful generation so regeneration requires it again', async () => {
    let resolveInvite: ((value: unknown) => void) | undefined;
    hooks.createInvitation.mockReturnValue(new Promise(resolve => resolveInvite = resolve));
    const container = render(
      '/ledgers/ledger%2Fa/invites',
      '/ledgers/:ledgerId/invites',
      createElement(LedgerInvitePage),
    );
    const consent = container.querySelector<HTMLInputElement>('[data-testid="invite-consent"] input');
    await act(async () => {
      container.querySelector<HTMLElement>('[data-testid="invite-consent"]')?.click();
    });
    expect(consent?.checked).toBe(true);

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="generate-invitation"]')?.click();
      resolveInvite?.({
        data: {
          code: 'ABC123',
          expiresAt: '2099-01-01T00:00:00.000Z',
          id: 'invite-1',
          ledgerId: 'ledger/a',
          status: 'ACTIVE',
          version: 1,
        },
        message: 'ok',
        statusCode: 201,
      });
      await Promise.resolve();
    });

    expect(container.textContent).toContain('ABC123');
    expect(localStorage.getItem('wh:ledger-invitation:ledger/a')).not.toBeNull();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="ledger-invite-revoke"]')?.click();
      await Promise.resolve();
    });
    expect(hooks.revokeInvitation).toHaveBeenCalledWith({
      invitationId: 'invite-1',
      ledgerId: 'ledger/a',
    });
    expect(localStorage.getItem('wh:ledger-invitation:ledger/a')).toBeNull();

    const consentAfter = container.querySelector<HTMLInputElement>('[data-testid="invite-consent"] input');
    expect(consentAfter?.checked).toBe(false);
    expect(container.querySelector<HTMLButtonElement>('[data-testid="generate-invitation"]')?.disabled).toBe(true);
  });

  it('switches to the expired state and clears storage when the countdown ends', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-17T10:00:00.000Z'));
    localStorage.setItem('wh:ledger-invitation:ledger/a', JSON.stringify({
      schemaVersion: 1,
      ledgerId: 'ledger/a',
      id: 'invite-1',
      code: 'DUE1',
      expiresAt: '2026-08-17T10:00:02.000Z',
      invitationVersion: 1,
    }));

    const container = render(
      '/ledgers/ledger%2Fa/invites',
      '/ledgers/:ledgerId/invites',
      createElement(LedgerInvitePage),
    );
    expect(container.querySelector('[data-testid="ledger-invite-code"]')?.textContent).toContain('DUE1');

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(container.textContent).toContain('invite.expired');
    expect(container.querySelector('[data-testid="ledger-invite-code"]')).toBeNull();
    expect(localStorage.getItem('wh:ledger-invitation:ledger/a')).toBeNull();
    vi.useRealTimers();
  });
});

describe('ledger members page', () => {
  it('shows the invite dock and join requests entry only with the matching capabilities', () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [
          LedgerCapability.MEMBER_READ,
          LedgerCapability.MEMBER_INVITE,
          LedgerCapability.MEMBER_REVIEW,
        ],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerMembersQuery.mockReturnValue({
      data: [{
        capabilities: [],
        id: 'member/me',
        joinedAt: '2026-07-21T00:00:00.000Z',
        nickname: '我',
        role: LedgerRole.OWNER,
        status: 'ACTIVE',
        user: { id: 1, name: '我' },
        version: 1,
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const container = render(
      '/ledgers/ledger%2Fa/members',
      '/ledgers/:ledgerId/members',
      createElement(LedgerMembersPage),
    );

    expect(container.querySelector('[data-testid="ledger-members-invite"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="ledger-members-requests"]')).not.toBeNull();
    expect(container.textContent).toContain('members.me');
  });

  it('hides the invite dock and join requests entry without their capabilities', () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: {
        ...ledger,
        capabilities: [LedgerCapability.MEMBER_READ],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerMembersQuery.mockReturnValue({
      data: [{
        capabilities: [],
        id: 'member/me',
        joinedAt: '2026-07-21T00:00:00.000Z',
        nickname: '我',
        role: LedgerRole.OWNER,
        status: 'ACTIVE',
        user: { id: 1, name: '我' },
        version: 1,
      }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const container = render(
      '/ledgers/ledger%2Fa/members',
      '/ledgers/:ledgerId/members',
      createElement(LedgerMembersPage),
    );

    expect(container.querySelector('[data-testid="ledger-members-invite"]')).toBeNull();
    expect(container.querySelector('[data-testid="ledger-members-requests"]')).toBeNull();
  });
});

describe('ledger join page', () => {
  it('uses the reference-style guided field layout instead of a compact settings card', () => {
    const container = render('/ledgers/join', '/ledgers/join', createElement(LedgerJoinPage));

    expect(container.querySelector('.ledger-join-page')).not.toBeNull();
    expect(container.querySelector('[data-testid="ledger-join-code-field"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="ledger-join-remark-field"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="ledger-join-submit"]')).not.toBeNull();
  });

  it('uses official mobile form controls and disables an empty submission', () => {
    const container = render('/ledgers/join', '/ledgers/join', createElement(LedgerJoinPage));

    expect(container.querySelector('.adm-nav-bar')).not.toBeNull();
    expect(container.querySelector('.adm-form')).not.toBeNull();
    expect(container.querySelector('.adm-input')).not.toBeNull();
    expect(container.querySelector('.adm-text-area')).not.toBeNull();
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBe(true);
  });

  it('submits normalized code and trimmed 1-30 character remark', async () => {
    hooks.submitJoinRequest.mockResolvedValue({ data: { id: 'request-1' } });
    const container = render('/ledgers/join', '/ledgers/join', createElement(LedgerJoinPage));
    const fields = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    const textareaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    await act(async () => {
      inputSetter?.call(fields[0], ' a b c 2 3 4 ');
      fields[0].dispatchEvent(new Event('input', { bubbles: true }));
      textareaSetter?.call(fields[1], ' 我是小勇 ');
      fields[1].dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(fields[0].value).toBe('ABC234');
    await act(async () => {
      container.querySelector<HTMLFormElement>('form')?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    expect(hooks.submitJoinRequest).toHaveBeenCalledWith({
      code: 'ABC234',
      data: {
        idempotencyKey: expect.stringMatching(/^ledger-join-/),
        remark: '我是小勇',
      },
    });
    expect(container.textContent).toContain('join.submittedTitle');
  });

  it('keeps an overlength normalized code disabled and does not submit it', async () => {
    const container = render('/ledgers/join', '/ledgers/join', createElement(LedgerJoinPage));
    const fields = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    const textareaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    await act(async () => {
      inputSetter?.call(fields[0], ' a b c 2 3 4 5 ');
      fields[0].dispatchEvent(new Event('input', { bubbles: true }));
      textareaSetter?.call(fields[1], '我是小勇');
      fields[1].dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(fields[0].value).toBe('ABC2345');
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBe(true);

    await act(async () => {
      container.querySelector<HTMLFormElement>('form')?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    expect(hooks.submitJoinRequest).not.toHaveBeenCalled();
  });

  it('guards a loading join request against duplicate submissions', async () => {
    let resolveRequest!: (value: unknown) => void;
    hooks.submitJoinRequest.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const container = render('/ledgers/join', '/ledgers/join', createElement(LedgerJoinPage));
    const fields = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const inputSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    const textareaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    await act(async () => {
      inputSetter?.call(fields[0], 'ABC234');
      fields[0].dispatchEvent(new Event('input', { bubbles: true }));
      textareaSetter?.call(fields[1], '我是小勇');
      fields[1].dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      const form = container.querySelector<HTMLFormElement>('form');
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });

    expect(hooks.submitJoinRequest).toHaveBeenCalledTimes(1);
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBe(true);

    await act(async () => {
      resolveRequest({ data: { id: 'request-1' } });
      await Promise.resolve();
    });
  });
});
