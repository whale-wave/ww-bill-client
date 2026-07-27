import type { ReactNode } from 'react';
import type { Household, HouseholdBudgetOverview, HouseholdChartResult, HouseholdMember } from '@/entities/household';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HouseholdBudgetPeriodType,
  HouseholdMemberRole,
  HouseholdStatus,
} from '@/entities/household';
import HouseholdBudgetsPage from '@/pages/household-budgets/HouseholdBudgetsPage';
import HouseholdChartsPage from '@/pages/household-charts/HouseholdChartsPage';
import HouseholdMembersPage from '@/pages/household-members/HouseholdMembersPage';
import HouseholdSettingsPage from '@/pages/household-settings/HouseholdSettingsPage';

const hooks = vi.hoisted(() => ({
  deleteBudget: vi.fn(),
  dissolve: vi.fn(),
  updateHousehold: vi.fn(),
  updateNickname: vi.fn(),
  upsertBudget: vi.fn(),
  useDeleteHouseholdBudgetMutation: vi.fn(),
  useDissolveHouseholdMutation: vi.fn(),
  useHouseholdBudgetsQuery: vi.fn(),
  useHouseholdChartsQuery: vi.fn(),
  useHouseholdMembersQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
  useUpdateHouseholdMutation: vi.fn(),
  useUpdateMyHouseholdNicknameMutation: vi.fn(),
  useUpsertHouseholdBudgetMutation: vi.fn(),
  useUserQuery: vi.fn(),
}));

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useDeleteHouseholdBudgetMutation: hooks.useDeleteHouseholdBudgetMutation,
  useDissolveHouseholdMutation: hooks.useDissolveHouseholdMutation,
  useHouseholdBudgetsQuery: hooks.useHouseholdBudgetsQuery,
  useHouseholdChartsQuery: hooks.useHouseholdChartsQuery,
  useHouseholdMembersQuery: hooks.useHouseholdMembersQuery,
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
  useUpdateHouseholdMutation: hooks.useUpdateHouseholdMutation,
  useUpdateMyHouseholdNicknameMutation: hooks.useUpdateMyHouseholdNicknameMutation,
  useUpsertHouseholdBudgetMutation: hooks.useUpsertHouseholdBudgetMutation,
}));

vi.mock('@/entities/user', () => ({ useGetUserUserInfoQuery: hooks.useUserQuery }));

vi.mock('@/shared/i18n', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({ chartDomRef: { current: null }, myChart: undefined }),
}));

const members: HouseholdMember[] = [
  { id: 'member-1', joinedAt: '2026-07-01T00:00:00.000Z', nickname: 'Avan', role: HouseholdMemberRole.OWNER, user: { id: 1, name: 'Avan' }, version: 2 },
  { id: 'member-2', joinedAt: '2026-07-02T00:00:00.000Z', nickname: '小勇', role: HouseholdMemberRole.PARTNER, user: { id: 2, name: '小勇' }, version: 1 },
];

const household: Household = {
  activatedAt: '2026-07-01T00:00:00.000Z',
  createdAt: '2026-07-01T00:00:00.000Z',
  id: 'household/a',
  members,
  myRole: HouseholdMemberRole.OWNER,
  sharedStartMonth: '2026-07-01',
  status: HouseholdStatus.ACTIVE,
  updatedAt: '2026-07-01T00:00:00.000Z',
  version: 3,
};

const budget: HouseholdBudgetOverview = {
  categories: [],
  periodStart: '2026-07-01',
  periodType: HouseholdBudgetPeriodType.MONTH,
  spendingByCategory: [],
  availableCategories: [],
  summary: {
    amount: '10000.00',
    budget: {
      amount: '10000.00',
      createdAt: '2026-07-01T00:00:00.000Z',
      householdId: household.id,
      id: 'budget-1',
      periodStart: '2026-07-01',
      periodType: HouseholdBudgetPeriodType.MONTH,
      updatedAt: '2026-07-01T00:00:00.000Z',
      version: 2,
    },
    remaining: '9000.00',
    remainingDaily: '900.00',
    remainingDays: 10,
    remainingPercent: 0.9,
    spent: '1000.00',
  },
};

const chart: HouseholdChartResult = {
  anchorDate: '2026-07-21',
  categories: [{ amount: '20.00', key: 'food', name: '餐饮', percent: 1 }],
  display: 'pie',
  endDate: '2026-07-31',
  members: [{ amount: '20.00', percent: 1, user: { id: 1, name: 'Avan' } }],
  metric: 'expense',
  period: 'month',
  startDate: '2026-07-01',
  summary: { expense: '20.00', income: '0.00', net: '-20.00' },
  timeline: [{ expense: '20.00', income: '0.00', key: '2026-07-21', label: '07-21', net: '-20.00' }],
};

let cleanup: (() => void) | undefined;

function query<T>(data: T) {
  return { data, isError: false, isLoading: false, refetch: vi.fn() };
}

function renderPage(pathname: string, routePath: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: routePath, element },
    { path: '/household', element: createElement('div', null, 'entry-target') },
    { path: '/households/:householdId', element: createElement('div', null, 'home-target') },
    { path: '/households/:householdId/members', element: createElement('div', null, 'members-target') },
    { path: '/households/:householdId/export', element: createElement('div', null, 'export-target') },
    { path: '/households/:householdId/invitation', element: createElement('div', null, 'invite-target') },
  ].filter((route, index, routes) => routes.findIndex(candidate => candidate.path === route.path) === index), { initialEntries: [pathname] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useMyHouseholdQuery.mockReturnValue(query(household));
  hooks.useHouseholdMembersQuery.mockReturnValue({ ...query(members), data: members });
  hooks.useHouseholdBudgetsQuery.mockReturnValue(query(budget));
  hooks.useHouseholdChartsQuery.mockReturnValue(query(chart));
  hooks.useUpsertHouseholdBudgetMutation.mockReturnValue([hooks.upsertBudget, { isLoading: false }]);
  hooks.useDeleteHouseholdBudgetMutation.mockReturnValue([hooks.deleteBudget, { isLoading: false }]);
  hooks.useUpdateHouseholdMutation.mockReturnValue([hooks.updateHousehold, { isLoading: false }]);
  hooks.useUpdateMyHouseholdNicknameMutation.mockReturnValue([hooks.updateNickname, { isLoading: false }]);
  hooks.useDissolveHouseholdMutation.mockReturnValue([hooks.dissolve, { isLoading: false }]);
  hooks.useUserQuery.mockReturnValue({ data: { id: 1 } });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('household budget and charts', () => {
  it('updates the total monthly budget with the API version', async () => {
    hooks.upsertBudget.mockResolvedValue({ data: budget.summary.budget });
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));
    const amount = container.querySelector<HTMLInputElement>('input[name="totalAmount"]');
    if (amount) {
      amount.value = '12000';
      amount.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await act(async () => container.querySelector<HTMLFormElement>('[data-testid="household-total-budget-form"]')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

    expect(hooks.upsertBudget).toHaveBeenCalledWith({
      data: {
        amount: '12000',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
        version: 2,
      },
      householdId: 'household/a',
    });
  });

  it('keeps yearly budget reads and writes pinned to January 1', async () => {
    hooks.upsertBudget.mockResolvedValue({ data: budget.summary.budget });
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-period-type="YEAR"]')?.click());
    const period = container.querySelector<HTMLInputElement>('input[aria-label="budget-period"]');
    if (period) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(period, '2027-07');
      period.dispatchEvent(new Event('input', { bubbles: true }));
    }

    expect(hooks.useHouseholdBudgetsQuery).toHaveBeenLastCalledWith({
      params: {
        filters: { periodStart: '2027-01-01', periodType: HouseholdBudgetPeriodType.YEAR },
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
  });

  it('switches charts to the canonical year query', async () => {
    const { container } = renderPage('/households/household%2Fa/charts', '/households/:householdId/charts', createElement(HouseholdChartsPage));
    const ranges = container.querySelectorAll('.chart-period-tabs > div');

    expect(container.querySelector('.adm-dropdown-item-title')).not.toBeNull();
    expect(ranges).toHaveLength(3);
    expect(container.querySelector('.bwm-nav-bar')).toBeNull();
    expect(container.querySelectorAll('select')).toHaveLength(0);

    await act(async () => (ranges[2] as HTMLElement).click());
    expect(hooks.useHouseholdChartsQuery).toHaveBeenLastCalledWith({
      params: {
        filters: expect.objectContaining({ display: 'line', metric: 'expense', period: 'year' }),
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
  });

  it('uses the default chart amount dropdown for the household income query', async () => {
    const { container } = renderPage('/households/household%2Fa/charts', '/households/:householdId/charts', createElement(HouseholdChartsPage));

    await act(async () => container.querySelector<HTMLElement>('.adm-dropdown-item-title')?.click());
    await act(async () => container.querySelector<HTMLElement>('[data-chart-amount-type="add"]')?.click());

    expect(hooks.useHouseholdChartsQuery).toHaveBeenLastCalledWith({
      params: {
        filters: expect.objectContaining({ display: 'line', metric: 'income', period: 'month' }),
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
  });
});

describe('household settings and members', () => {
  it('opens household export from settings with the URL household id', async () => {
    const { container, router } = renderPage('/households/household%2Fa/settings', '/households/:householdId/settings', createElement(HouseholdSettingsPage));
    const exportButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent?.includes('settings.export'));
    await act(async () => exportButton?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/export');
  });

  it('updates the current member nickname with its own version', async () => {
    hooks.updateNickname.mockResolvedValue({ data: {} });
    const { container } = renderPage('/households/household%2Fa/settings', '/households/:householdId/settings', createElement(HouseholdSettingsPage));
    const nickname = container.querySelector<HTMLInputElement>('input[name="nickname"]');
    if (nickname) {
      nickname.value = '阿勇';
      nickname.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await act(async () => container.querySelector<HTMLFormElement>('[data-testid="household-nickname-form"]')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(hooks.updateNickname).toHaveBeenCalledWith({
      data: { nickname: '阿勇', version: 2 },
      householdId: 'household/a',
    });
  });

  it('limits an owner to moving the sharing boundary later', () => {
    const { container } = renderPage('/households/household%2Fa/settings', '/households/:householdId/settings', createElement(HouseholdSettingsPage));
    const input = container.querySelector<HTMLInputElement>('input[name="sharedStartMonth"]');
    expect(input?.min).toBe('2026-07');
  });

  it('hides owner-only sharing boundary controls from the partner', () => {
    hooks.useMyHouseholdQuery.mockReturnValue(query({
      ...household,
      myRole: HouseholdMemberRole.PARTNER,
    }));
    hooks.useUserQuery.mockReturnValue({ data: { id: 2 } });
    const { container } = renderPage('/households/household%2Fa/settings', '/households/:householdId/settings', createElement(HouseholdSettingsPage));

    expect(container.querySelector('input[name="sharedStartMonth"]')).toBeNull();
    expect(container.textContent).not.toContain('settings.sharedStartTitle');
  });

  it('loads member rows using only the URL household id', () => {
    const { container } = renderPage('/households/household%2Fa/members', '/households/:householdId/members', createElement(HouseholdMembersPage));
    expect(hooks.useHouseholdMembersQuery).toHaveBeenCalledWith({ params: { householdId: 'household/a' } });
    expect(container.querySelectorAll('[data-member-id]')).toHaveLength(2);
  });
});
