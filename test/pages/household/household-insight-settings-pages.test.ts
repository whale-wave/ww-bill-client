import type { ReactNode } from 'react';
import type { Household, HouseholdBudgetOverview, HouseholdChartResult, HouseholdMember } from '@/entities/household';
import { ActionSheet, Dialog, Toast } from 'antd-mobile';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetEntityType } from '@/entities/budget';
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
  chartSetOption: vi.fn(),
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

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({ chartDomRef: { current: null }, myChart: { setOption: hooks.chartSetOption } }),
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

function renderPage(pathname: string, routePath: string, element: ReactNode, previousPath?: string) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: routePath, element },
    { path: '/household', element: createElement('div', null, 'entry-target') },
    { path: '/households/:householdId', element: createElement('div', null, 'home-target') },
    { path: '/households/:householdId/members', element: createElement('div', null, 'members-target') },
    { path: '/households/:householdId/export', element: createElement('div', null, 'export-target') },
    { path: '/households/:householdId/invitation', element: createElement('div', null, 'invite-target') },
  ].filter((route, index, routes) => routes.findIndex(candidate => candidate.path === route.path) === index), {
    initialEntries: previousPath ? [previousPath, pathname] : [pathname],
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

function getBudgetModal(container: HTMLElement) {
  return container.querySelector<HTMLElement>('.adm-modal')
    ?? document.body.querySelector<HTMLElement>('.adm-modal');
}

function setBudgetAmount(modal: HTMLElement | null | undefined, value: string) {
  const amount = modal?.querySelector<HTMLInputElement>('input[name="householdBudgetAmount"]');
  if (!amount)
    return;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(amount, value);
    amount.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function confirmBudgetModal(modal: HTMLElement | null | undefined) {
  await act(async () => modal?.querySelectorAll<HTMLElement>('.adm-modal-button')[0]?.click());
}

function householdCategoryOverview(version = 7): HouseholdBudgetOverview {
  return {
    ...budget,
    availableCategories: [{
      categoryKey: 'food',
      categoryName: 'Dining',
      iconKey: 'food',
    }],
    categories: [{
      budget: {
        ...budget.summary.budget!,
        categoryKey: 'food',
        categoryName: 'Dining',
        iconKey: 'food',
        id: 'category-budget-1',
        version,
      },
      remaining: '70.00',
      remainingPercent: 0.7,
      spent: '30.00',
    }],
  };
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
  act(() => Toast.clear());
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('household budget and charts', () => {
  it('maps the household response into the default budget rows and ring percentage', () => {
    hooks.useHouseholdBudgetsQuery.mockReturnValue(query({
      ...budget,
      categories: [{
        budget: {
          ...budget.summary.budget!,
          categoryKey: 'food',
          categoryName: 'Dining',
          iconKey: 'food',
          id: 'category-budget-1',
        },
        remaining: '70.00',
        remainingPercent: 0.7,
        spent: '30.00',
      }],
    }));
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    expect(container.querySelector('[data-budget-page-shell]')).not.toBeNull();
    expect(container.querySelector('.adm-dropdown-item-title')).not.toBeNull();
    expect(container.querySelector('.bwm-nav-bar-right [data-budget-period-start]')).toBeNull();
    expect(container.querySelector('[data-budget-id="budget-1"]')).not.toBeNull();
    expect(container.querySelector('[data-budget-id="category-budget-1"]')?.textContent).toContain('Dining');
    expect(container.querySelector('[data-budget-add-category]')?.closest('.fixed')).not.toBeNull();
    expect(container.querySelector('[data-testid="household-total-budget-form"]')).toBeNull();
    expect(container.querySelector('[data-period-type]')).toBeNull();
    expect(container.querySelector('[style*="conic-gradient"]')).toBeNull();
    expect(hooks.chartSetOption.mock.calls[0]?.[0]).toEqual(expect.objectContaining({
      series: expect.arrayContaining([
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ value: 90 }),
          ]),
        }),
      ]),
    }));
  });

  it('uses the full-page summary empty state when the summary budget is missing', () => {
    hooks.useHouseholdBudgetsQuery.mockReturnValue(query({
      ...householdCategoryOverview(),
      summary: {
        ...budget.summary,
        amount: '0.00',
        budget: null,
        remaining: '0.00',
        remainingPercent: null,
      },
    }));
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    expect(container.querySelector('[data-budget-create-summary]')).not.toBeNull();
    expect(container.querySelector('[data-budget-id="category-budget-1"]')).toBeNull();
    expect(container.querySelector('[data-budget-add-category]')).toBeNull();
    expect(container.querySelectorAll('.adm-error-block')).toHaveLength(1);
  });

  it('keeps the original solid create action before any budget is created', () => {
    hooks.useHouseholdBudgetsQuery.mockReturnValue(query({
      ...budget,
      summary: {
        ...budget.summary,
        amount: '0.00',
        budget: null,
        remaining: '0.00',
        remainingPercent: null,
      },
    }));
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    expect(container.textContent).toContain('emptyBudget');
    expect(container.textContent).not.toContain('emptyCategoryBudget');
    expect(container.querySelector('[data-budget-add-category]')).toBeNull();
    expect(container.querySelectorAll('.adm-error-block')).toHaveLength(1);
    const createButton = container.querySelector('[data-budget-create-summary]');
    expect(createButton?.classList.contains('adm-button-primary')).toBe(true);
    expect(createButton?.classList.contains('adm-button-fill-outline')).toBe(false);
    expect(createButton?.classList.contains('justify-center')).toBe(true);
  });

  it.each([
    ['loading', { data: undefined, isError: false, isLoading: true, refetch: vi.fn() }, 'household-loading'],
    ['error', { data: undefined, isError: true, isLoading: false, refetch: vi.fn() }, 'household-error'],
  ])('keeps a working budget back control during scope %s', async (_state, scopeQuery, stateTestId) => {
    hooks.useMyHouseholdQuery.mockReturnValue(scopeQuery);
    const { container, router } = renderPage(
      '/households/household%2Fa/budgets',
      '/households/:householdId/budgets',
      createElement(HouseholdBudgetsPage),
      '/household',
    );

    const back = container.querySelector<HTMLElement>('.bwm-nav-bar-back');
    expect(container.querySelector(`[data-testid="${stateTestId}"]`)).not.toBeNull();
    expect(back).not.toBeNull();
    expect(back?.textContent).toContain('common:nav.back');

    await act(async () => back?.click());
    expect(router.state.location.pathname).toBe('/household');
  });

  it('uses the same two-option month/year dropdown as the personal budget page', async () => {
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));
    await act(async () => container.querySelector<HTMLElement>('.adm-dropdown-item-title')?.click());

    const monthOption = container.querySelector<HTMLElement>(`[data-budget-type="${BudgetEntityType.MONTH}"]`)
      ?? document.body.querySelector<HTMLElement>(`[data-budget-type="${BudgetEntityType.MONTH}"]`);
    const yearOption = container.querySelector<HTMLElement>(`[data-budget-type="${BudgetEntityType.YEAR}"]`)
      ?? document.body.querySelector<HTMLElement>(`[data-budget-type="${BudgetEntityType.YEAR}"]`);
    expect(monthOption).not.toBeNull();
    expect(yearOption).not.toBeNull();
    expect(container.querySelectorAll('[data-budget-type]')).toHaveLength(2);
    expect(container.querySelector('[data-budget-period-start]')).toBeNull();

    await act(async () => yearOption?.click());

    expect(hooks.useHouseholdBudgetsQuery).toHaveBeenLastCalledWith({
      params: {
        filters: {
          periodStart: expect.stringMatching(/^\d{4}-01-01$/),
          periodType: HouseholdBudgetPeriodType.YEAR,
        },
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
  });

  it('edits the summary in the default action-sheet and modal rhythm with its version', async () => {
    hooks.upsertBudget.mockResolvedValue({ data: budget.summary.budget });
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-id="budget-1"]')?.click());
    expect(actionSheet).toHaveBeenCalledOnce();
    act(() => actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());

    const modal = getBudgetModal(container);
    const amount = modal?.querySelector<HTMLInputElement>('input[name="householdBudgetAmount"]');
    expect(amount?.value).toBe('10000.00');
    setBudgetAmount(modal, '12000');
    await confirmBudgetModal(modal);

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

  it('creates a summary without an optimistic version', async () => {
    hooks.upsertBudget.mockResolvedValue({ data: {} });
    hooks.useHouseholdBudgetsQuery.mockReturnValue(query({
      ...budget,
      summary: {
        ...budget.summary,
        amount: '0.00',
        budget: null,
        remaining: '0.00',
        remainingPercent: null,
      },
    }));
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-create-summary]')?.click());
    const modal = getBudgetModal(container);
    setBudgetAmount(modal, '8000');
    await confirmBudgetModal(modal);

    expect(hooks.upsertBudget).toHaveBeenCalledWith({
      data: {
        amount: '8000',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
      },
      householdId: 'household/a',
    });
  });

  it('deletes the summary with its optimistic version', async () => {
    hooks.deleteBudget.mockResolvedValue({ data: { deleted: true, id: 'budget-1' } });
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    vi.spyOn(Dialog, 'confirm').mockResolvedValue(true);
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-id="budget-1"]')?.click());
    await act(async () => actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'delete')?.onClick?.());
    await act(async () => Promise.resolve());

    expect(hooks.deleteBudget).toHaveBeenCalledWith({
      budgetId: 'budget-1',
      householdId: 'household/a',
      version: 2,
    });
  });

  it('closes a stale summary editor after conflict and retries with the refreshed version', async () => {
    const conflict = { message: 'conflict', statusCode: 409 };
    const refreshedBudget: HouseholdBudgetOverview = {
      ...budget,
      summary: {
        ...budget.summary,
        amount: '11000.00',
        budget: {
          ...budget.summary.budget!,
          amount: '11000.00',
          version: 3,
        },
      },
    };
    const refetch = vi.fn(async () => {
      hooks.useHouseholdBudgetsQuery.mockReturnValue({
        ...query(refreshedBudget),
        refetch,
      });
      return { data: refreshedBudget };
    });
    hooks.useHouseholdBudgetsQuery.mockReturnValue({
      ...query(budget),
      refetch,
    });
    hooks.upsertBudget
      .mockRejectedValueOnce(conflict)
      .mockResolvedValueOnce({ data: refreshedBudget.summary.budget });
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    vi.spyOn(Toast, 'show').mockReturnValue({ close: vi.fn() });
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-id="budget-1"]')?.click());
    act(() => actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());
    setBudgetAmount(getBudgetModal(container), '12000');
    await confirmBudgetModal(getBudgetModal(container));

    expect(refetch).toHaveBeenCalledOnce();

    act(() => container.querySelector<HTMLElement>('[data-budget-id="budget-1"]')?.click());
    act(() => actionSheet.mock.calls[1]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());
    expect(getBudgetModal(container)?.querySelector<HTMLInputElement>('input[name="householdBudgetAmount"]')?.value).toBe('11000.00');
    setBudgetAmount(getBudgetModal(container), '12500');
    await confirmBudgetModal(getBudgetModal(container));

    expect(hooks.upsertBudget).toHaveBeenNthCalledWith(1, {
      data: {
        amount: '12000',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
        version: 2,
      },
      householdId: 'household/a',
    });
    expect(hooks.upsertBudget).toHaveBeenNthCalledWith(2, {
      data: {
        amount: '12500',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
        version: 3,
      },
      householdId: 'household/a',
    });
  });

  it('creates a category from only the API available-category choices', async () => {
    hooks.upsertBudget.mockResolvedValue({ data: {} });
    hooks.useHouseholdBudgetsQuery.mockReturnValue(query({
      ...budget,
      availableCategories: [
        {
          categoryKey: 'food',
          categoryName: 'Dining',
          iconKey: 'food',
        },
        {
          categoryKey: 'travel',
          categoryName: 'Travel',
          iconKey: 'travel',
        },
      ],
      categories: [{
        budget: {
          ...budget.summary.budget!,
          categoryKey: 'food',
          categoryName: 'Dining',
          id: 'category-budget-1',
        },
        remaining: '70.00',
        remainingPercent: 0.7,
        spent: '30.00',
      }],
    }));
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-add-category]')?.click());
    const modal = getBudgetModal(container);
    expect(modal?.textContent).toContain('Travel');
    expect(modal?.textContent).not.toContain('Dining');
    act(() => modal?.querySelector<HTMLElement>('.adm-selector-item')?.click());
    setBudgetAmount(modal, '500');
    await confirmBudgetModal(modal);

    expect(hooks.upsertBudget).toHaveBeenCalledWith({
      data: {
        amount: '500',
        categoryKey: 'travel',
        categoryNameSnapshot: 'Travel',
        iconKeySnapshot: 'travel',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
      },
      householdId: 'household/a',
    });
  });

  it('keeps the original category snapshots and version when editing a category', async () => {
    hooks.upsertBudget.mockResolvedValue({ data: {} });
    hooks.useHouseholdBudgetsQuery.mockReturnValue(query({
      ...householdCategoryOverview(7),
      availableCategories: [
        {
          categoryKey: 'food',
          categoryName: 'Dining',
          iconKey: 'food',
        },
        {
          categoryKey: 'travel',
          categoryName: 'Travel',
          iconKey: 'travel',
        },
      ],
    }));
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-id="category-budget-1"]')?.click());
    act(() => actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());

    const modal = getBudgetModal(container);
    const travelOption = [...modal?.querySelectorAll<HTMLElement>('.adm-selector-item') ?? []]
      .find(option => option.textContent?.includes('Travel'));
    expect(travelOption?.classList).toContain('adm-selector-item-disabled');
    act(() => travelOption?.click());
    setBudgetAmount(modal, '600');
    await confirmBudgetModal(modal);

    expect(hooks.upsertBudget).toHaveBeenCalledWith({
      data: {
        amount: '600',
        categoryKey: 'food',
        categoryNameSnapshot: 'Dining',
        iconKeySnapshot: 'food',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
        version: 7,
      },
      householdId: 'household/a',
    });
  });

  it('edits a category and retries with refreshed snapshots and version after conflict', async () => {
    const initialOverview = householdCategoryOverview(7);
    const refreshedOverview = householdCategoryOverview(8);
    const conflict = { message: 'conflict', statusCode: 409 };
    const refetch = vi.fn(async () => {
      hooks.useHouseholdBudgetsQuery.mockReturnValue({
        ...query(refreshedOverview),
        refetch,
      });
      return { data: refreshedOverview };
    });
    hooks.useHouseholdBudgetsQuery.mockReturnValue({
      ...query(initialOverview),
      refetch,
    });
    hooks.upsertBudget
      .mockRejectedValueOnce(conflict)
      .mockResolvedValueOnce({ data: refreshedOverview.categories[0]?.budget });
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    vi.spyOn(Toast, 'show').mockReturnValue({ close: vi.fn() });
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-id="category-budget-1"]')?.click());
    act(() => actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());
    setBudgetAmount(getBudgetModal(container), '600');
    await confirmBudgetModal(getBudgetModal(container));

    expect(refetch).toHaveBeenCalledOnce();

    act(() => container.querySelector<HTMLElement>('[data-budget-id="category-budget-1"]')?.click());
    act(() => actionSheet.mock.calls[1]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());
    setBudgetAmount(getBudgetModal(container), '650');
    await confirmBudgetModal(getBudgetModal(container));

    expect(hooks.upsertBudget).toHaveBeenNthCalledWith(1, {
      data: {
        amount: '600',
        categoryKey: 'food',
        categoryNameSnapshot: 'Dining',
        iconKeySnapshot: 'food',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
        version: 7,
      },
      householdId: 'household/a',
    });
    expect(hooks.upsertBudget).toHaveBeenNthCalledWith(2, {
      data: {
        amount: '650',
        categoryKey: 'food',
        categoryNameSnapshot: 'Dining',
        iconKeySnapshot: 'food',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
        version: 8,
      },
      householdId: 'household/a',
    });
  });

  it('deletes a category with its optimistic version', async () => {
    hooks.deleteBudget.mockResolvedValue({ data: { deleted: true, id: 'category-budget-1' } });
    hooks.useHouseholdBudgetsQuery.mockReturnValue(query(householdCategoryOverview(7)));
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    vi.spyOn(Dialog, 'confirm').mockResolvedValue(true);
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-id="category-budget-1"]')?.click());
    await act(async () => actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'delete')?.onClick?.());
    await act(async () => Promise.resolve());

    expect(hooks.deleteBudget).toHaveBeenCalledWith({
      budgetId: 'category-budget-1',
      householdId: 'household/a',
      version: 7,
    });
  });

  it('deletes a category with its version and refetches on conflict', async () => {
    const refetch = vi.fn();
    const conflict = { message: 'conflict', statusCode: 409 };
    hooks.deleteBudget.mockRejectedValue(conflict);
    hooks.useHouseholdBudgetsQuery.mockReturnValue({
      ...query({
        ...budget,
        categories: [{
          budget: {
            ...budget.summary.budget!,
            categoryKey: 'food',
            categoryName: 'Dining',
            id: 'category-budget-1',
            version: 7,
          },
          remaining: '70.00',
          remainingPercent: 0.7,
          spent: '30.00',
        }],
      }),
      refetch,
    });
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    vi.spyOn(Dialog, 'confirm').mockResolvedValue(true);
    vi.spyOn(Toast, 'show').mockReturnValue({ close: vi.fn() });
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

    act(() => container.querySelector<HTMLElement>('[data-budget-id="category-budget-1"]')?.click());
    await act(async () => actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'delete')?.onClick?.());
    await act(async () => Promise.resolve());

    expect(hooks.deleteBudget).toHaveBeenCalledWith({
      budgetId: 'category-budget-1',
      householdId: 'household/a',
      version: 7,
    });
    expect(refetch).toHaveBeenCalledOnce();
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

  it('renders exact household totals, averages, category and member rankings', () => {
    hooks.useHouseholdChartsQuery.mockReturnValue(query({
      ...chart,
      categories: [
        { amount: '20.00', key: 'food', name: '餐饮', percent: 0.3333 },
        { amount: '40.50', key: 'travel', name: '交通', percent: 0.6667 },
      ],
      members: [
        { amount: '60.50', percent: 1, user: { id: 1, name: 'Avan' } },
      ],
      summary: {
        expense: '10000000000000000.01',
        income: '0.00',
        net: '-10000000000000000.01',
      },
      timeline: [
        { expense: '0.01', income: '0.00', key: '2026-07-19', label: '07-19', net: '-0.01' },
        { expense: '9999999999999999.99', income: '0.00', key: '2026-07-20', label: '07-20', net: '-9999999999999999.99' },
        { expense: '0.01', income: '0.00', key: '2026-07-21', label: '07-21', net: '-0.01' },
      ],
    }));

    const { container } = renderPage('/households/household%2Fa/charts', '/households/:householdId/charts', createElement(HouseholdChartsPage));
    const categoryRows = [...container.querySelectorAll('.adm-list-item')];
    const foodRow = categoryRows.find(row => row.textContent?.includes('餐饮'));
    const travelRow = categoryRows.find(row => row.textContent?.includes('交通'));
    const memberRow = categoryRows.find(row => row.textContent?.includes('Avan'));

    expect(container.textContent).toContain('totalExpend10000000000000000.01');
    expect(container.textContent).toContain('averageLabel3333333333333333.34');
    expect(foodRow?.textContent).toContain('餐饮33.33%20.00');
    expect(travelRow?.textContent).toContain('交通66.67%40.50');
    expect(memberRow?.textContent).toContain('Avan100%60.50');
    expect(foodRow instanceof HTMLElement ? foodRow.onclick : undefined).toBeNull();
  });

  it.each(['week', 'month'] as const)('keeps %s household day labels stable and renders aggregate tooltips', async (period) => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    hooks.useHouseholdChartsQuery.mockReturnValue(query({
      ...chart,
      endDate: period === 'week' ? '2026-07-26' : chart.endDate,
      period,
      startDate: period === 'week' ? '2026-07-20' : chart.startDate,
    }));
    const { container } = renderPage(`/households/household%2Fa/charts?range=${period}`, '/households/:householdId/charts', createElement(HouseholdChartsPage));

    const option = hooks.chartSetOption.mock.calls.at(-1)?.[0] as {
      series: Array<{
        data: Array<{
          source: { amount: string; displayLabel?: string; value: string };
          value: number;
        }>;
      }>;
      tooltip: {
        formatter: (params: Array<{
          data: {
            source: { amount: string; displayLabel?: string; value: string };
            value: number;
          };
        }>) => string;
      };
      xAxis: { data: string[] };
    };
    const point = option.series[0].data[0];
    const tooltip = option.tooltip.formatter([{ data: point }]);

    expect(point.source.amount).toBe('20.00');
    expect(point.source.displayLabel).toBe('07-21');
    expect(point.value).toBe(20);
    expect(option.xAxis.data).toEqual(['07-21']);
    expect(tooltip).toContain('07-21');
    expect(tooltip).not.toContain('07-20');
    expect(tooltip).toContain('当月总支出:');
    expect(tooltip).toContain('20.00');
    expect(tooltip).not.toContain('没有费用');

    await act(async () => container.querySelector<HTMLElement>('.adm-dropdown-item-title')?.click());
    await act(async () => container.querySelector<HTMLElement>('[data-chart-amount-type="add"]')?.click());

    const incomeOption = hooks.chartSetOption.mock.calls.at(-1)?.[0] as typeof option;
    const incomePoint = incomeOption.series[0].data[0];
    const incomeTooltip = incomeOption.tooltip.formatter([{ data: incomePoint }]);
    expect(incomePoint.source.amount).toBe('0.00');
    expect(incomeTooltip).toContain('当月总收入:');
    expect(incomeTooltip).toContain('0.00');
    expect(incomeTooltip).not.toContain('没有费用');
  });

  it('uses the household API label for yearly axes and aggregate tooltips', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    hooks.useHouseholdChartsQuery.mockReturnValue(query({
      ...chart,
      endDate: '2026-12-31',
      period: 'year',
      startDate: '2026-01-01',
      timeline: [
        { expense: '20.00', income: '0.00', key: '2026-01', label: '1月', net: '-20.00' },
      ],
    }));

    renderPage('/households/household%2Fa/charts?range=year', '/households/:householdId/charts', createElement(HouseholdChartsPage));
    const option = hooks.chartSetOption.mock.calls.at(-1)?.[0] as {
      series: Array<{
        data: Array<{
          source: { displayLabel?: string };
          value: number;
        }>;
      }>;
      tooltip: {
        formatter: (params: Array<{
          data: {
            source: { displayLabel?: string };
            value: number;
          };
        }>) => string;
      };
      xAxis: { data: string[] };
    };
    const point = option.series[0].data[0];
    const tooltip = option.tooltip.formatter([{ data: point }]);

    expect(point.source.displayLabel).toBe('1月');
    expect(option.xAxis.data).toEqual(['1月']);
    expect(tooltip).toContain('1月');
    expect(tooltip).not.toContain('01-01');
  });

  it('renders the shared empty state for a wholly empty household chart response', () => {
    hooks.useHouseholdChartsQuery.mockReturnValue(query({
      ...chart,
      categories: [],
      members: [],
      summary: { expense: '0.00', income: '0.00', net: '0.00' },
      timeline: Array.from({ length: 31 }, (_, index) => {
        const day = String(index + 1).padStart(2, '0');
        return {
          expense: '0.00',
          income: '0.00',
          key: `2026-07-${day}`,
          label: `07-${day}`,
          net: '0.00',
        };
      }),
    }));

    const { container } = renderPage('/households/household%2Fa/charts', '/households/:householdId/charts', createElement(HouseholdChartsPage));

    expect(container.textContent).toContain('emptyTitle');
    expect(container.textContent).toContain('emptyDescription');
    expect(container.textContent).not.toContain('totalExpend');
    expect(container.textContent).not.toContain('charts.categoryRanking');
    expect(container.textContent).not.toContain('charts.memberRanking');
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
