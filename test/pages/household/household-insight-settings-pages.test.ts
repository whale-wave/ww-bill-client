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
  useHouseholdChartPeriodsQuery: vi.fn(),
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
  useHouseholdChartPeriodsQuery: hooks.useHouseholdChartPeriodsQuery,
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
  anchorDate: '2026-07-01',
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

function getBudgetEditor(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-budget-editor]')
    ?? document.body.querySelector<HTMLElement>('[data-budget-editor]');
}

function setBudgetAmount(editor: HTMLElement | null | undefined, value: string) {
  const amount = editor?.querySelector<HTMLInputElement>('input[name="householdBudgetAmount"]');
  expect(amount).toBeInstanceOf(HTMLInputElement);
  if (!amount)
    return;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(amount, value);
    amount.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function saveBudgetEditor(editor: HTMLElement | null | undefined) {
  const saveButton = [...editor?.querySelectorAll<HTMLButtonElement>('button') ?? []]
    .find(button => button.textContent === 'common.save');
  expect(saveButton).not.toBeUndefined();
  await act(async () => saveButton?.click());
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
  hooks.useHouseholdChartPeriodsQuery.mockReturnValue(query([{
    anchorDate: '2026-07-01',
    key: '2026-07',
    month: 7,
    period: 'month',
    year: 2026,
  }]));
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
    expect(container.querySelector(`[data-budget-type="${BudgetEntityType.MONTH}"]`)).not.toBeNull();
    expect(container.querySelectorAll('[data-budget-type]')).toHaveLength(2);
    expect(container.querySelector('[data-budget-id="budget-1"]')).not.toBeNull();
    expect(container.querySelector('[data-budget-id="category-budget-1"]')?.textContent).toContain('Dining');
    expect(container.querySelector('[data-budget-add-category]')).not.toBeNull();
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

    expect(container.querySelector('[data-testid="budget-empty-state"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="budget-empty-state"] button')).not.toBeNull();
    expect(container.querySelector('[data-budget-id="category-budget-1"]')).toBeNull();
    expect(container.querySelector('[data-budget-add-category]')).toBeNull();
    expect(container.querySelectorAll('[data-testid="budget-empty-state"]')).toHaveLength(1);
  });

  it('keeps one actionable summary empty state before any budget is created', () => {
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
    expect(container.querySelectorAll('[data-testid="budget-empty-state"]')).toHaveLength(1);
    const createButton = container.querySelector<HTMLButtonElement>('[data-testid="budget-empty-state"] button');
    expect(createButton?.textContent).toBe('addBudget');
    expect(createButton?.type).toBe('button');
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

    const back = container.querySelector<HTMLButtonElement>('button[aria-label="common:nav.back"]');
    expect(container.querySelector(`[data-testid="${stateTestId}"]`)).not.toBeNull();
    expect(back).not.toBeNull();
    expect(back?.getAttribute('aria-label')).toBe('common:nav.back');

    await act(async () => back?.click());
    expect(router.state.location.pathname).toBe('/household');
  });

  it('uses the same two-option month/year selector as the personal budget page', async () => {
    const { container } = renderPage('/households/household%2Fa/budgets', '/households/:householdId/budgets', createElement(HouseholdBudgetsPage));

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

    const editor = getBudgetEditor(container);
    const amount = editor?.querySelector<HTMLInputElement>('input[name="householdBudgetAmount"]');
    expect(amount?.value).toBe('10000.00');
    setBudgetAmount(editor, '12000');
    await saveBudgetEditor(editor);

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

    act(() => container.querySelector<HTMLElement>('[data-testid="budget-empty-state"] button')?.click());
    const editor = getBudgetEditor(container);
    setBudgetAmount(editor, '8000');
    await saveBudgetEditor(editor);

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
    setBudgetAmount(getBudgetEditor(container), '12000');
    await saveBudgetEditor(getBudgetEditor(container));

    expect(refetch).toHaveBeenCalledOnce();

    act(() => container.querySelector<HTMLElement>('[data-budget-id="budget-1"]')?.click());
    act(() => actionSheet.mock.calls[1]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());
    expect(getBudgetEditor(container)?.querySelector<HTMLInputElement>('input[name="householdBudgetAmount"]')?.value).toBe('11000.00');
    setBudgetAmount(getBudgetEditor(container), '12500');
    await saveBudgetEditor(getBudgetEditor(container));

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
    const editor = getBudgetEditor(container);
    expect(editor?.textContent).toContain('Travel');
    expect(editor?.textContent).not.toContain('Dining');
    act(() => editor?.querySelector<HTMLElement>('[role="option"]')?.click());
    setBudgetAmount(editor, '500');
    await saveBudgetEditor(editor);

    expect(hooks.upsertBudget).toHaveBeenCalledWith({
      data: {
        amount: '500',
        categoryKey: 'travel',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
      },
      householdId: 'household/a',
    });
  });

  it('keeps the category key and version when editing a category', async () => {
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

    const editor = getBudgetEditor(container);
    const travelOption = [...editor?.querySelectorAll<HTMLElement>('[role="option"]') ?? []]
      .find(option => option.textContent?.includes('Travel'));
    expect(travelOption?.getAttribute('aria-selected')).toBe('false');
    act(() => travelOption?.click());
    expect(travelOption?.getAttribute('aria-selected')).toBe('false');
    setBudgetAmount(editor, '600');
    await saveBudgetEditor(editor);

    expect(hooks.upsertBudget).toHaveBeenCalledWith({
      data: {
        amount: '600',
        categoryKey: 'food',
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        periodType: HouseholdBudgetPeriodType.MONTH,
        version: 7,
      },
      householdId: 'household/a',
    });
  });

  it('edits a category and retries with the refreshed version after conflict', async () => {
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
    setBudgetAmount(getBudgetEditor(container), '600');
    await saveBudgetEditor(getBudgetEditor(container));

    expect(refetch).toHaveBeenCalledOnce();

    act(() => container.querySelector<HTMLElement>('[data-budget-id="category-budget-1"]')?.click());
    act(() => actionSheet.mock.calls[1]?.[0].actions.find(action => action.key === 'edit')?.onClick?.());
    setBudgetAmount(getBudgetEditor(container), '650');
    await saveBudgetEditor(getBudgetEditor(container));

    expect(hooks.upsertBudget).toHaveBeenNthCalledWith(1, {
      data: {
        amount: '600',
        categoryKey: 'food',
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
    const ranges = container.querySelectorAll('.chart-period-tabs > button');

    expect(container.querySelector('[data-chart-amount-type="sub"]')).not.toBeNull();
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

  it.each([
    ['', 'line'],
    ['?display=line', 'line'],
    ['?display=pie', 'pie'],
    ['?display=unknown', 'line'],
    ['?display=line&display=pie', 'line'],
  ] as const)('resolves household chart display %s to %s', (search, display) => {
    const { container } = renderPage(
      `/households/household%2Fa/charts${search}`,
      '/households/:householdId/charts',
      createElement(HouseholdChartsPage),
    );

    expect(container.querySelector(`[data-chart-display-option="${display}"]`)?.getAttribute('aria-pressed')).toBe('true');
    expect(hooks.useHouseholdChartsQuery).toHaveBeenLastCalledWith(expect.objectContaining({
      params: expect.objectContaining({ filters: expect.objectContaining({ display }) }),
    }));
  });

  it('changes only the household chart display query parameter', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa/charts?amount=sub&range=month&date=2026-07-01',
      '/households/:householdId/charts',
      createElement(HouseholdChartsPage),
    );

    await act(async () => container.querySelector<HTMLElement>('[data-chart-display-option="pie"]')?.click());

    expect(router.state.location.search).toBe('?amount=sub&range=month&date=2026-07-01&display=pie');
    expect(hooks.useHouseholdChartsQuery).toHaveBeenLastCalledWith(expect.objectContaining({
      params: expect.objectContaining({ filters: expect.objectContaining({ display: 'pie' }) }),
    }));
  });

  it('renders household category segments and legend in pie mode', () => {
    hooks.useHouseholdChartsQuery.mockReturnValue(query({
      ...chart,
      categories: [
        { amount: '50.00', key: 'food', name: '餐饮', percent: 0.5 },
        { amount: '30.00', key: 'travel', name: '交通', percent: 0.3 },
        { amount: '10.00', key: 'home', name: '住房', percent: 0.1 },
        { amount: '5.00', key: 'fun', name: '娱乐', percent: 0.05 },
        { amount: '5.00', key: 'other', name: '其他分类', percent: 0.05 },
      ],
    }));

    const { container } = renderPage(
      '/households/household%2Fa/charts?display=pie',
      '/households/:householdId/charts',
      createElement(HouseholdChartsPage),
    );

    expect(container.querySelector('[data-household-pie-chart]')).not.toBeNull();
    expect(container.querySelector('[data-household-pie-legend]')?.textContent).toContain('餐饮50%');
    expect(container.querySelector('[data-household-pie-legend]')?.textContent).toContain('other5%');
    expect(hooks.chartSetOption).toHaveBeenLastCalledWith(expect.objectContaining({
      series: [expect.objectContaining({
        data: [
          expect.objectContaining({ id: 'category:food', name: '餐饮', value: 50 }),
          expect.objectContaining({ id: 'category:travel', name: '交通', value: 30 }),
          expect.objectContaining({ id: 'category:home', name: '住房', value: 10 }),
          expect.objectContaining({ id: 'category:fun', name: '娱乐', value: 5 }),
          expect.objectContaining({ id: 'aggregate:other', name: 'other', value: 5 }),
        ],
      })],
    }));
  });

  it('shows a category empty state without initializing a pie chart', () => {
    hooks.useHouseholdChartsQuery.mockReturnValue(query({
      ...chart,
      categories: [],
      summary: { expense: '20.00', income: '0.00', net: '-20.00' },
    }));

    const { container } = renderPage(
      '/households/household%2Fa/charts?display=pie',
      '/households/:householdId/charts',
      createElement(HouseholdChartsPage),
    );

    expect(container.querySelector('[data-household-pie-empty]')?.textContent).toContain('noCategoryData');
    expect(container.querySelector('[data-household-pie-chart]')).toBeNull();
    expect(hooks.chartSetOption).not.toHaveBeenCalled();
  });

  it('renders counted household weeks with relative labels and selects an older week', async () => {
    hooks.useHouseholdChartPeriodsQuery.mockReturnValue(query([
      { anchorDate: '2025-12-22', isoWeek: 52, isoWeekYear: 2025, key: '2025-W52', period: 'week' },
      { anchorDate: '2026-08-10', isoWeek: 33, isoWeekYear: 2026, key: '2026-W33', period: 'week' },
      { anchorDate: '2026-08-17', isoWeek: 34, isoWeekYear: 2026, key: '2026-W34', period: 'week' },
      { anchorDate: '2026-08-24', isoWeek: 35, isoWeekYear: 2026, key: '2026-W35', period: 'week' },
    ]));
    hooks.useHouseholdChartsQuery.mockReturnValue(query({
      ...chart,
      anchorDate: '2026-08-24',
      endDate: '2026-08-30',
      period: 'week',
      startDate: '2026-08-24',
      timeline: Array.from({ length: 7 }, (_, index) => ({
        expense: '1.00',
        income: '0.00',
        key: `2026-08-${String(24 + index).padStart(2, '0')}`,
        label: `08-${String(24 + index).padStart(2, '0')}`,
        net: '-1.00',
      })),
    }));
    const { container, router } = renderPage('/households/household%2Fa/charts?range=week', '/households/:householdId/charts', createElement(HouseholdChartsPage));

    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[data-chart-period-options] > button')];
    expect(tabs.map(tab => tab.textContent)).toEqual(['tab.yearWeekNumber', 'tab.weekNumber', 'tab.lastWeek', 'tab.thisWeek']);
    expect(tabs[3]?.getAttribute('aria-pressed')).toBe('true');
    await act(async () => tabs[1]?.click());
    expect(router.state.location.search).toContain('date=2026-08-10');
    expect(hooks.useHouseholdChartsQuery).toHaveBeenLastCalledWith(expect.objectContaining({
      params: expect.objectContaining({ filters: expect.objectContaining({ anchorDate: '2026-08-10' }) }),
    }));
  });

  it('prioritizes relative names for current and previous months', () => {
    hooks.useHouseholdChartPeriodsQuery.mockReturnValue(query([
      { anchorDate: '2025-12-01', key: '2025-12', month: 12, period: 'month', year: 2025 },
      { anchorDate: '2026-07-01', key: '2026-07', month: 7, period: 'month', year: 2026 },
      { anchorDate: '2026-08-01', key: '2026-08', month: 8, period: 'month', year: 2026 },
    ]));
    hooks.useHouseholdChartsQuery.mockReturnValue(query({ ...chart, anchorDate: '2026-08-01' }));
    const { container } = renderPage('/households/household%2Fa/charts?range=month', '/households/:householdId/charts', createElement(HouseholdChartsPage));
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[data-chart-period-options] > button')];
    expect(tabs.map(tab => tab.textContent)).toEqual(['tab.yearMonthNumber', 'tab.lastMonth', 'tab.thisMonth']);
  });

  it('uses the shared amount selector for the household income query', async () => {
    const { container } = renderPage('/households/household%2Fa/charts', '/households/:householdId/charts', createElement(HouseholdChartsPage));

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
    const categoryRows = [...container.querySelectorAll('[data-chart-ranking-item]')];
    const foodRow = categoryRows.find(row => row.textContent?.includes('餐饮'));
    const travelRow = categoryRows.find(row => row.textContent?.includes('交通'));
    const memberRow = categoryRows.find(row => row.textContent?.includes('Avan'));

    expect(container.textContent).toContain('totalExpend¥10000000000000000.01');
    expect(container.textContent).toContain('averageLabel¥3333333333333333.34');
    expect(foodRow?.textContent).toContain('餐饮33.33%20.00');
    expect(travelRow?.textContent).toContain('交通66.67%40.50');
    expect(memberRow?.textContent).toContain('Avan100%60.50');
    expect(foodRow instanceof HTMLElement ? foodRow.onclick : undefined).not.toBeNull();
    expect(memberRow instanceof HTMLElement ? memberRow.onclick : undefined).toBeNull();
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

  it('dissolves the household and lands on the entry page with a terminated state', async () => {
    hooks.dissolve.mockResolvedValue({ data: { id: 'household/a', status: 'DISSOLVED' } });
    const { container, router } = renderPage(
      '/households/household%2Fa/settings',
      '/households/:householdId/settings',
      createElement(HouseholdSettingsPage),
      '/households/household%2Fa',
    );

    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="dissolve"]')?.click());
    const confirm = document.body.querySelector<HTMLInputElement>('input[name="confirmDissolve"]');
    confirm?.click();
    const form = confirm?.closest('form');
    await act(async () => form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

    expect(hooks.dissolve).toHaveBeenCalled();
    expect(router.state.location.pathname).toBe('/household');
    expect((router.state.location.state as { dissolved?: boolean } | null)?.dissolved).toBe(true);
  });

  it('updates the current member nickname with its own version', async () => {
    hooks.updateNickname.mockResolvedValue({ data: {} });
    const { container } = renderPage('/households/household%2Fa/members', '/households/:householdId/members', createElement(HouseholdMembersPage));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-member-id="member-1"]')?.click());
    const nickname = document.body.querySelector<HTMLInputElement>('input[name="nickname"]');
    if (nickname) {
      nickname.value = '阿勇';
      nickname.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await act(async () => nickname?.form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(hooks.updateNickname).toHaveBeenCalledWith({
      data: { nickname: '阿勇', version: 2 },
      householdId: 'household/a',
    });
  });

  it('limits an owner to moving the sharing boundary later', async () => {
    const { container } = renderPage('/households/household%2Fa/settings', '/households/:householdId/settings', createElement(HouseholdSettingsPage));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="shared-start"]')?.click());
    const field = document.body.querySelector('[data-testid="shared-start-month-field"]');
    expect(field?.textContent).toBe('2026-07');
  });

  it('submits the sharing boundary month as the first day of the picked month', async () => {
    hooks.updateHousehold.mockResolvedValue({ data: { ...household, sharedStartMonth: '2026-07-01' } });
    const { container } = renderPage('/households/household%2Fa/settings', '/households/:householdId/settings', createElement(HouseholdSettingsPage));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="shared-start"]')?.click());

    const field = document.body.querySelector('[data-testid="shared-start-month-field"]');
    const form = field?.closest('form');
    await act(async () => form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

    expect(hooks.updateHousehold).toHaveBeenCalledWith({
      data: { sharedStartMonth: '2026-07-01', version: household.version },
      householdId: 'household/a',
    });
  });

  it('hides owner-only sharing boundary controls from the partner', () => {
    hooks.useMyHouseholdQuery.mockReturnValue(query({
      ...household,
      myRole: HouseholdMemberRole.PARTNER,
    }));
    hooks.useUserQuery.mockReturnValue({ data: { id: 2 } });
    const { container } = renderPage('/households/household%2Fa/settings', '/households/:householdId/settings', createElement(HouseholdSettingsPage));

    expect(container.querySelector('[data-testid="shared-start-month-field"]')).toBeNull();
    expect(container.textContent).toContain('settings.sharedStartTitle');
    expect(container.querySelector('[data-settings-row="shared-start"]')?.tagName).toBe('DIV');
  });

  it('loads member rows using only the URL household id', () => {
    const { container } = renderPage('/households/household%2Fa/members', '/households/:householdId/members', createElement(HouseholdMembersPage));
    expect(hooks.useHouseholdMembersQuery).toHaveBeenCalledWith({ params: { householdId: 'household/a' } });
    expect(container.querySelectorAll('[data-member-id]')).toHaveLength(2);
  });
});
