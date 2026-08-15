import type { ReactNode } from 'react';
import type { Household, HouseholdInvitation, HouseholdInvitationPreview } from '@/entities/household';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdMemberRole, HouseholdStatus } from '@/entities/household';
import HouseholdCreatePage from '@/pages/household-create/HouseholdCreatePage';
import HouseholdEntryPage from '@/pages/household-entry/HouseholdEntryPage';
import HouseholdInvitationPreviewPage from '@/pages/household-invitation-preview/HouseholdInvitationPreviewPage';
import HouseholdInvitationPage from '@/pages/household-invitation/HouseholdInvitationPage';
import HouseholdJoinPage from '@/pages/household-join/HouseholdJoinPage';

const hooks = vi.hoisted(() => ({
  acceptInvitation: vi.fn(),
  createHousehold: vi.fn(),
  createInvitation: vi.fn(),
  refetchMine: vi.fn(),
  refetchPreview: vi.fn(),
  revokeInvitation: vi.fn(),
  useAcceptHouseholdInvitationMutation: vi.fn(),
  useCachedHouseholdInvitation: vi.fn(),
  useCreateHouseholdInvitationMutation: vi.fn(),
  useCreateHouseholdMutation: vi.fn(),
  useGetRecordBillQuery: vi.fn(),
  useHouseholdInvitationPreviewQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
  useRevokeHouseholdInvitationMutation: vi.fn(),
}));

const toastShow = vi.hoisted(() => vi.fn());

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useAcceptHouseholdInvitationMutation: hooks.useAcceptHouseholdInvitationMutation,
  useCachedHouseholdInvitation: hooks.useCachedHouseholdInvitation,
  useCreateHouseholdInvitationMutation: hooks.useCreateHouseholdInvitationMutation,
  useCreateHouseholdMutation: hooks.useCreateHouseholdMutation,
  useHouseholdInvitationPreviewQuery: hooks.useHouseholdInvitationPreviewQuery,
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
  useRevokeHouseholdInvitationMutation: hooks.useRevokeHouseholdInvitationMutation,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useGetRecordBillQuery: hooks.useGetRecordBillQuery,
}));

vi.mock('antd-mobile', async importOriginal => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Toast: { show: toastShow },
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const household: Household = {
  activatedAt: '2026-07-21T00:00:00.000Z',
  createdAt: '2026-07-21T00:00:00.000Z',
  id: 'household/a',
  members: [],
  myRole: HouseholdMemberRole.OWNER,
  sharedStartMonth: '2026-07-01',
  status: HouseholdStatus.ACTIVE,
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 1,
};

const invitation: HouseholdInvitation = {
  code: 'ABC123',
  expiresAt: '2026-07-22T00:00:00.000Z',
  householdId: household.id,
  id: 'invite/a',
  status: 'ACTIVE' as HouseholdInvitation['status'],
  version: 1,
};

const preview: HouseholdInvitationPreview = {
  creator: { id: 1, name: 'Avan' },
  expiresAt: '2026-07-22T00:00:00.000Z',
  householdId: household.id,
  householdVersion: 4,
  members: [],
  sharedStartMonth: '2026-07-01',
};

let cleanup: (() => void) | undefined;

function successfulQuery<T>(data: T) {
  return { data, isError: false, isLoading: false, refetch: vi.fn() };
}

function renderPage(pathname: string, routePath: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: routePath, element },
    { path: '/household', element: createElement('div', null, 'entry-target') },
    { path: '/household/create', element: createElement('div', null, 'create-target') },
    { path: '/household/join', element: createElement('div', null, 'join-target') },
    { path: '/household-invitations/:code', element: createElement('div', null, 'preview-target') },
    { path: '/households/:householdId', element: createElement('div', null, 'home-target') },
    { path: '/households/:householdId/invitation', element: createElement('div', null, 'invitation-target') },
  ].filter((route, index, routes) => routes.findIndex(candidate => candidate.path === route.path) === index), {
    initialEntries: [pathname],
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, root, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  toastShow.mockReset();
  hooks.useMyHouseholdQuery.mockReturnValue(successfulQuery(null));
  hooks.useGetRecordBillQuery.mockReturnValue({
    data: {
      all: { income: 0, expand: 0, balance: 0 },
      list: {},
      earliestMonth: null,
    },
  });
  hooks.useCreateHouseholdMutation.mockReturnValue([hooks.createHousehold, { isLoading: false }]);
  hooks.useCreateHouseholdInvitationMutation.mockReturnValue([hooks.createInvitation, { isLoading: false }]);
  hooks.useRevokeHouseholdInvitationMutation.mockReturnValue([hooks.revokeInvitation, { isLoading: false }]);
  hooks.useAcceptHouseholdInvitationMutation.mockReturnValue([hooks.acceptInvitation, { isLoading: false }]);
  hooks.useCachedHouseholdInvitation.mockReturnValue(undefined);
  hooks.useHouseholdInvitationPreviewQuery.mockReturnValue(successfulQuery(preview));
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('household entry', () => {
  it('shows create and join actions when no household exists', async () => {
    const { container, router } = renderPage('/household', '/household', createElement(HouseholdEntryPage));

    expect(container.textContent).toContain('entry.none');
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-create"]')?.click());
    expect(router.state.location.pathname).toBe('/household/create');
  });

  it('routes an active household to its URL-scoped home', async () => {
    hooks.useMyHouseholdQuery.mockReturnValue(successfulQuery(household));
    const { router } = renderPage('/household', '/household', createElement(HouseholdEntryPage));
    await act(async () => Promise.resolve());
    expect(router.state.location.pathname).toBe('/households/household%2Fa');
  });

  it('returns to the bills page after dissolution instead of a dead household address', async () => {
    hooks.useMyHouseholdQuery.mockReturnValue(successfulQuery(null));
    const container = document.createElement('div');
    const root = createRoot(container);
    const router = createMemoryRouter([
      { path: '/household', element: createElement(HouseholdEntryPage) },
      { path: '/detail', element: createElement('div', null, 'detail-target') },
    ], {
      initialEntries: [{ pathname: '/household', state: { dissolved: true } }],
    });
    act(() => root.render(createElement(RouterProvider, { router })));

    await act(async () => container.querySelector<HTMLElement>('.bwm-nav-bar-back')?.click());
    expect(router.state.location.pathname).toBe('/detail');

    act(() => root.unmount());
  });
});

describe('household creation and join', () => {
  it('requires explicit consent and prevents duplicate creation', async () => {
    let resolveCreate: ((value: { data: { household: Household; invitation: HouseholdInvitation } }) => void) | undefined;
    hooks.createHousehold.mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve;
    }));
    const { container, router } = renderPage('/household/create', '/household/create', createElement(HouseholdCreatePage));
    const form = container.querySelector<HTMLFormElement>('form');
    const consent = container.querySelector<HTMLInputElement>('input[type="checkbox"]');
    consent?.click();

    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });

    expect(hooks.createHousehold).toHaveBeenCalledOnce();
    expect(hooks.createHousehold).toHaveBeenCalledWith(expect.objectContaining({
      sharedStartMonth: expect.stringMatching(/^\d{4}-\d{2}-01$/),
      sharingConsentConfirmed: true,
    }));

    await act(async () => {
      resolveCreate?.({ data: { household, invitation } });
      await Promise.resolve();
    });
    expect(router.state.location.pathname).toBe('/households/household%2Fa/invitation');
  });

  it('normalizes the invite code into the preview URL', async () => {
    const { container, router } = renderPage('/household/join', '/household/join', createElement(HouseholdJoinPage));
    const input = container.querySelector<HTMLInputElement>('input');
    const form = container.querySelector<HTMLFormElement>('form');

    await act(async () => {
      if (input) {
        input.value = ' ab/c 123 ';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(router.state.location.pathname).toBe('/household-invitations/AB%2FC123');
  });
});

describe('household create shared start month', () => {
  function billQueryData(earliestMonth: string | null) {
    return {
      all: { income: 0, expand: 0, balance: 0 },
      list: {},
      earliestMonth,
    };
  }

  it('defaults the month to the first record month and blocks earlier months', async () => {
    hooks.useGetRecordBillQuery.mockReturnValue({ data: billQueryData('2024-07') });
    const { container } = renderPage('/household/create', '/household/create', createElement(HouseholdCreatePage));
    await act(async () => Promise.resolve());

    const input = container.querySelector<HTMLInputElement>('input[type="month"]');
    expect(input?.value).toBe('2024-07');
    expect(input?.min).toBe('2024-07');
  });

  it('falls back to the current month without a lower bound when there are no records', async () => {
    hooks.useGetRecordBillQuery.mockReturnValue({ data: billQueryData(null) });
    const { container } = renderPage('/household/create', '/household/create', createElement(HouseholdCreatePage));
    await act(async () => Promise.resolve());

    const input = container.querySelector<HTMLInputElement>('input[type="month"]');
    expect(input?.value).toMatch(/^\d{4}-\d{2}$/);
    expect(input?.min).toBe('');
  });

  it('does not overwrite a manually picked month when the earliest month arrives later', async () => {
    let billData = billQueryData(null);
    hooks.useGetRecordBillQuery.mockImplementation(() => ({ data: billData }));
    const { container, root, router } = renderPage('/household/create', '/household/create', createElement(HouseholdCreatePage));
    await act(async () => Promise.resolve());

    const input = container.querySelector<HTMLInputElement>('input[type="month"]');
    act(() => {
      if (input) {
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setValue?.call(input, '2025-01');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    billData = billQueryData('2024-07');
    act(() => root.render(createElement(RouterProvider, { router })));
    await act(async () => Promise.resolve());

    expect(container.querySelector<HTMLInputElement>('input[type="month"]')?.value).toBe('2025-01');
  });
});

describe('household invitation', () => {
  it('accepts only after explicit mutual consent and routes to canonical home', async () => {
    hooks.acceptInvitation.mockResolvedValue({ data: household });
    const { container, router } = renderPage(
      '/household-invitations/ABC123',
      '/household-invitations/:code',
      createElement(HouseholdInvitationPreviewPage),
    );
    container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-accept"]')?.click());

    expect(hooks.acceptInvitation).toHaveBeenCalledWith({
      code: 'ABC123',
      data: {
        expectedHouseholdVersion: 4,
        expectedSharedStartMonth: '2026-07-01',
        sharingConsentConfirmed: true,
      },
    });
    expect(router.state.location.pathname).toBe('/households/household%2Fa');
  });

  it('refreshes a stale preview and requires consent again after a 409', async () => {
    hooks.acceptInvitation.mockRejectedValue({ statusCode: 409 });
    hooks.refetchPreview.mockResolvedValue({ data: preview });
    hooks.useHouseholdInvitationPreviewQuery.mockReturnValue({
      ...successfulQuery(preview),
      refetch: hooks.refetchPreview,
    });
    const { container } = renderPage(
      '/household-invitations/ABC123',
      '/household-invitations/:code',
      createElement(HouseholdInvitationPreviewPage),
    );
    const consent = container.querySelector<HTMLInputElement>('input[type="checkbox"]');
    consent?.click();
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-accept"]')?.click());

    expect(hooks.refetchPreview).toHaveBeenCalledOnce();
    expect(consent?.checked).toBe(false);
  });

  it('generates a code from the pending household id', async () => {
    hooks.useMyHouseholdQuery.mockReturnValue(successfulQuery({ ...household, status: HouseholdStatus.PENDING_PARTNER }));
    hooks.createInvitation.mockResolvedValue({ data: invitation });
    const { container } = renderPage(
      '/households/household%2Fa/invitation',
      '/households/:householdId/invitation',
      createElement(HouseholdInvitationPage),
    );
    container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-generate-invite"]')?.click());

    expect(hooks.createInvitation).toHaveBeenCalledWith({
      data: expect.objectContaining({ sharingConsentConfirmed: true }),
      householdId: 'household/a',
    });
  });
});
