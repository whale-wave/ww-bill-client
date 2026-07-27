import type { ReactNode } from 'react';
import type { FamilyRecord, Household, HouseholdRecordsPage } from '@/entities/household';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FamilyRecordPolicy,
  HouseholdMemberRole,
  HouseholdStatus,
} from '@/entities/household';
import HouseholdCalendarPage from '@/pages/household-calendar/HouseholdCalendarPage';
import HouseholdHomePage from '@/pages/household-home/HouseholdHomePage';
import HouseholdRecordDetailPage from '@/pages/household-record-detail/HouseholdRecordDetailPage';
import HouseholdRecordPolicyPage from '@/pages/household-record-policy/HouseholdRecordPolicyPage';
import HouseholdRecordSearchPage from '@/pages/household-record-search/HouseholdRecordSearchPage';

const hooks = vi.hoisted(() => ({
  fetchNextRecords: vi.fn(),
  refetchRecords: vi.fn(),
  refetchRecordPolicy: vi.fn(),
  setPolicy: vi.fn(),
  useHouseholdCalendarQuery: vi.fn(),
  useFamilyRecordPolicyQuery: vi.fn(),
  useHouseholdMembersQuery: vi.fn(),
  useHouseholdRecordQuery: vi.fn(),
  useInfiniteHouseholdRecordsQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
  useSetFamilyRecordPolicyMutation: vi.fn(),
  useUserQuery: vi.fn(),
}));

const locale = vi.hoisted(() => ({ language: 'en' }));

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useHouseholdCalendarQuery: hooks.useHouseholdCalendarQuery,
  useFamilyRecordPolicyQuery: hooks.useFamilyRecordPolicyQuery,
  useHouseholdMembersQuery: hooks.useHouseholdMembersQuery,
  useHouseholdRecordQuery: hooks.useHouseholdRecordQuery,
  useInfiniteHouseholdRecordsQuery: hooks.useInfiniteHouseholdRecordsQuery,
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
  useSetFamilyRecordPolicyMutation: hooks.useSetFamilyRecordPolicyMutation,
}));

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: hooks.useUserQuery,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: locale.language },
    t: (key: string) => key,
  }),
}));

const household: Household = {
  activatedAt: '2026-07-01T00:00:00.000Z',
  createdAt: '2026-07-01T00:00:00.000Z',
  id: 'household/a',
  members: [],
  myRole: HouseholdMemberRole.OWNER,
  sharedStartMonth: '2026-07-01',
  status: HouseholdStatus.ACTIVE,
  updatedAt: '2026-07-01T00:00:00.000Z',
  version: 1,
};

const record: FamilyRecord = {
  amount: '20.00',
  category: { icon: '餐', id: 1, name: '餐饮' },
  counted: true,
  creator: { id: 1, name: 'Avan' },
  effectivePolicy: FamilyRecordPolicy.SHARED_COUNTED,
  id: 7,
  policy: FamilyRecordPolicy.INHERIT,
  policyVersion: 3,
  remark: '晚餐',
  tags: [],
  time: '2026-07-21T12:00:00.000Z',
  type: 'sub',
  version: 2,
};

const recordsPage: HouseholdRecordsPage = {
  data: [record],
  limit: 100,
  offset: 0,
  summary: { expense: '20.00', income: '0.00', net: '-20.00' },
  total: 1,
};

let cleanup: (() => void) | undefined;

function query<T>(data: T) {
  return { data, isError: false, isLoading: false, records: (data as HouseholdRecordsPage)?.data ?? [], refetch: hooks.refetchRecords };
}

function renderPage(pathname: string, routePath: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: routePath, element },
    { path: '/households/:householdId/records/search', element: createElement('div', null, 'search-target') },
    { path: '/households/:householdId/records/:recordId', element: createElement('div', null, 'detail-target') },
    { path: '/households/:householdId/records/:recordId/policy', element: createElement('div', null, 'policy-target') },
    { path: '/ledgers/:ledgerId/records/:recordId', element: createElement('div', null, 'personal-record-target') },
    { path: '/households/:householdId/charts', element: createElement('div', null, 'charts-target') },
    { path: '/households/:householdId', element: createElement('div', null, 'home-target') },
  ].filter((route, index, routes) => routes.findIndex(candidate => candidate.path === route.path) === index), { initialEntries: [pathname] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  locale.language = 'en';
  hooks.useMyHouseholdQuery.mockReturnValue(query(household));
  hooks.useInfiniteHouseholdRecordsQuery.mockReturnValue({
    ...query(recordsPage),
    fetchNextPage: hooks.fetchNextRecords,
    hasNextPage: false,
    isFetchingNextPage: false,
  });
  hooks.useFamilyRecordPolicyQuery.mockReturnValue({
    data: {
      effectivePolicy: FamilyRecordPolicy.SHARED_COUNTED,
      householdId: household.id,
      policy: FamilyRecordPolicy.INHERIT,
      recordId: 7,
      version: 3,
    },
    isError: false,
    isLoading: false,
    refetch: hooks.refetchRecordPolicy,
  });
  hooks.useHouseholdMembersQuery.mockReturnValue(query([]));
  hooks.useHouseholdRecordQuery.mockReturnValue(query(record));
  hooks.useHouseholdCalendarQuery.mockReturnValue({
    data: { days: [{ countedExpense: '20.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 1, visibleExpense: '20.00', visibleIncome: '0.00' }], month: '2026-07-01' },
    days: [{ countedExpense: '20.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 1, visibleExpense: '20.00', visibleIncome: '0.00' }],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useSetFamilyRecordPolicyMutation.mockReturnValue([hooks.setPolicy, { isLoading: false }]);
  hooks.useUserQuery.mockReturnValue({ data: { id: 1 } });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('household records', () => {
  it('renders the household home title, settings action, and monthly totals in one header', () => {
    const { container } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    const header = container.querySelector('[data-testid="household-home-header"]');
    const title = header?.querySelector('h1');
    expect(header?.matches('[data-record-overview-header]')).toBe(true);
    expect(title?.textContent).toBe('home.title');
    expect(header?.firstElementChild?.querySelector('h1')).toBe(title);
    expect(title?.parentElement?.classList).toContain('text-left');
    expect([...header?.querySelectorAll('button') ?? []]
      .map(button => button.getAttribute('aria-label'))
      .filter(Boolean)
      .sort()).toEqual(['home.settings']);
    expect(header?.querySelector('[data-testid="household-detail-month-picker"]')?.textContent).toContain('07');
    expect(header?.querySelector('input[type="month"]')).not.toBeNull();
    expect(header?.querySelector('[data-testid="household-monthly-income"]')?.textContent).toContain('0.00');
    expect(header?.querySelector('[data-testid="household-monthly-expense"]')?.textContent).toContain('20.00');
    expect(container.textContent).not.toContain('common.net');
  });

  it('adapts the household month control to the original detail trigger structure', () => {
    const { container } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    const picker = container.querySelector('[data-testid="household-detail-month-picker"]');
    const monthInput = picker?.querySelector('input[type="month"]');
    expect(picker?.textContent).toContain('common.month');
    expect(monthInput?.classList).toContain('opacity-0');
  });

  it('keeps household-scoped routes on every home shortcut', async () => {
    const { container, router } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    expect(container.querySelector('[data-testid="household-shortcuts-card"]')).not.toBeNull();
    const shortcuts = [
      ['budget', '/households/household%2Fa/budgets'],
      ['search', '/households/household%2Fa/records/search'],
      ['calendar', '/households/household%2Fa/calendar'],
      ['settings', '/households/household%2Fa/settings'],
    ] as const;

    for (const [shortcut, path] of shortcuts) {
      await act(async () => container.querySelector<HTMLButtonElement>(`[data-testid="household-${shortcut}"]`)?.click());
      expect(router.state.location.pathname).toBe(path);
      await act(async () => router.navigate('/households/household%2Fa'));
    }
  });

  it('groups home records by date with daily totals and shared category icons', () => {
    const expenseRecord: FamilyRecord = {
      ...record,
      category: { icon: 'catering', id: 1, name: 'Dining' },
      remark: 'Dinner',
    };
    const incomeRecord: FamilyRecord = {
      ...record,
      amount: '100.00',
      category: { icon: 'investment', id: 2, name: 'Investment' },
      id: 8,
      remark: '奖金',
      time: '2026-07-20T09:00:00.000Z',
      type: 'add',
    };
    hooks.useInfiniteHouseholdRecordsQuery.mockReturnValue({
      ...query({ ...recordsPage, data: [expenseRecord, incomeRecord] }),
      fetchNextPage: hooks.fetchNextRecords,
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    hooks.useHouseholdCalendarQuery.mockReturnValue({
      data: {
        days: [
          { countedExpense: '20.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 1, visibleExpense: '20.00', visibleIncome: '0.00' },
          { countedExpense: '0.00', countedIncome: '100.00', date: '2026-07-20', recordCount: 1, visibleExpense: '0.00', visibleIncome: '100.00' },
        ],
        month: '2026-07-01',
      },
      days: [
        { countedExpense: '20.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 1, visibleExpense: '20.00', visibleIncome: '0.00' },
        { countedExpense: '0.00', countedIncome: '100.00', date: '2026-07-20', recordCount: 1, visibleExpense: '0.00', visibleIncome: '100.00' },
      ],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const { container } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    const dateGroup = container.querySelector('[data-date-group="2026-07-21"]');
    const recordRow = container.querySelector('[data-record-id="7"]');
    const amount = recordRow?.lastElementChild?.lastElementChild;
    const incomeAmount = container.querySelector('[data-record-id="8"]')?.lastElementChild?.lastElementChild;
    expect(container.querySelector('[data-testid="record-overview-list"]')).not.toBeNull();
    expect(dateGroup?.textContent).toContain('records.dailyExpense');
    expect(dateGroup?.textContent).toContain('20.00');
    expect(recordRow?.classList).toContain('h-[55px]');
    expect(recordRow?.classList).not.toContain('min-h-[60px]');
    expect(amount?.classList).toContain('text-font-black');
    expect(amount?.classList).not.toContain('text-rose-500');
    expect(incomeAmount?.textContent).toBe('100.00');
    expect(container.querySelector('[data-date-group="2026-07-20"]')?.textContent).toContain('records.dailyIncome');
    expect(container.querySelector('[data-category-icon="catering"] use')?.getAttribute('xlink:href')).toBe('#icon-catering');
    expect(container.textContent).not.toContain('catering');
  });

  it('uses complete server daily totals when a date crosses the loaded page boundary', () => {
    hooks.useInfiniteHouseholdRecordsQuery.mockReturnValue({
      ...query({ ...recordsPage, data: [record], total: 51 }),
      fetchNextPage: hooks.fetchNextRecords,
      hasNextPage: true,
      isFetchingNextPage: false,
    });
    hooks.useHouseholdCalendarQuery.mockReturnValue({
      data: {
        days: [{ countedExpense: '50.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 2, visibleExpense: '50.00', visibleIncome: '0.00' }],
        month: '2026-07-01',
      },
      days: [{ countedExpense: '50.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 2, visibleExpense: '50.00', visibleIncome: '0.00' }],
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    const { container } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    const dateHeader = container.querySelector('[data-date-group="2026-07-21"] > header');
    expect(dateHeader?.textContent).toContain('50.00');
    expect(dateHeader?.textContent).not.toContain('20.00');
    expect(container.querySelector('[data-testid="household-records-load-more"]')).not.toBeNull();
  });

  it.each([
    ['en', 'Tue, Jul 21'],
    ['zh-CN', '7月21日周二'],
  ])('formats date headings for the %s locale', (language, expectedHeading) => {
    locale.language = language;
    const { container } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    const heading = container.querySelector('time[datetime="2026-07-21"]');
    expect(heading?.textContent).toBe(expectedHeading);
    expect(heading?.textContent).not.toBe('2026-07-21');
  });

  it('preserves the default amount presentation outside the compact home list', () => {
    const { container } = renderPage(
      '/households/household%2Fa/records/search',
      '/households/:householdId/records/search',
      createElement(HouseholdRecordSearchPage),
    );

    const amount = container.querySelector('[data-record-id="7"]')?.lastElementChild;
    expect(amount?.classList).not.toContain('shrink-0');
    expect(amount?.classList).not.toContain('pl-3');
  });

  it('uses the decoded URL household id and opens the family record detail', async () => {
    const { container, router } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    expect(hooks.useInfiniteHouseholdRecordsQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ householdId: 'household/a' }),
    }));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-record-id="7"]')?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/7');
  });

  it('shows family record detail and lets its owner open visibility settings', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa/records/7',
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
    );

    expect(hooks.useHouseholdRecordQuery).toHaveBeenCalledWith({
      params: { householdId: 'household/a', recordId: 7 },
      queryOptions: { enabled: true },
    });
    expect(container.textContent).toContain('晚餐');
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-record-policy"]')?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/7/policy');
  });

  it('maps search URL filters directly into the records query', () => {
    renderPage(
      '/households/household%2Fa/records/search?keyword=%E9%A4%90&type=sub&memberUserId=2&startDate=2026-07-01&endDate=2026-07-31',
      '/households/:householdId/records/search',
      createElement(HouseholdRecordSearchPage),
    );

    expect(hooks.useInfiniteHouseholdRecordsQuery).toHaveBeenCalledWith({
      params: {
        filters: {
          endDate: '2026-07-31',
          keyword: '餐',
          limit: 50,
          memberUserId: 2,
          offset: 0,
          startDate: '2026-07-01',
          type: 'sub',
        },
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
  });

  it('saves one of the four policies with optimistic version', async () => {
    hooks.setPolicy.mockResolvedValue({ data: { householdId: household.id, ledgerId: 'default-ledger', recordId: 7 } });
    const { container, router } = renderPage(
      '/households/household%2Fa/records/7/policy',
      '/households/:householdId/records/:recordId/policy',
      createElement(HouseholdRecordPolicyPage),
    );
    const privateOption = container.querySelector<HTMLInputElement>(`input[value="${FamilyRecordPolicy.PRIVATE}"]`);
    await act(async () => privateOption?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-policy-save"]')?.click());

    expect(hooks.setPolicy).toHaveBeenCalledWith({
      data: { policy: FamilyRecordPolicy.PRIVATE, version: 3 },
      householdId: 'household/a',
      recordId: 7,
    });
    expect(hooks.useFamilyRecordPolicyQuery).toHaveBeenCalledWith({
      params: { householdId: 'household/a', recordId: 7 },
      queryOptions: { enabled: true },
    });
    expect(router.state.location.pathname).toBe('/ledgers/default-ledger/records/7');
  });

  it('requests subsequent record pages from the home list', async () => {
    hooks.useInfiniteHouseholdRecordsQuery.mockReturnValue({
      ...query({ ...recordsPage, total: 101 }),
      fetchNextPage: hooks.fetchNextRecords,
      hasNextPage: true,
      isFetchingNextPage: false,
    });
    const { container } = renderPage(
      '/households/household%2Fa',
      '/households/:householdId',
      createElement(HouseholdHomePage),
    );

    expect(container.textContent).not.toContain('records.total');
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-records-load-more"]')?.click());
    expect(hooks.useInfiniteHouseholdRecordsQuery).toHaveBeenLastCalledWith({
      params: {
        filters: expect.objectContaining({ limit: 50, offset: 0 }),
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
    expect(hooks.fetchNextRecords).toHaveBeenCalledTimes(1);
  });

  it('loads a private record policy directly so it can be restored to sharing', async () => {
    hooks.useFamilyRecordPolicyQuery.mockReturnValue({
      data: {
        effectivePolicy: FamilyRecordPolicy.PRIVATE,
        householdId: household.id,
        policy: FamilyRecordPolicy.PRIVATE,
        recordId: 7,
        version: 4,
      },
      isError: false,
      isLoading: false,
      refetch: hooks.refetchRecordPolicy,
    });
    hooks.setPolicy.mockResolvedValue({ data: { householdId: household.id, recordId: 7 } });
    const { container } = renderPage(
      '/households/household%2Fa/records/7/policy',
      '/households/:householdId/records/:recordId/policy',
      createElement(HouseholdRecordPolicyPage),
    );
    const inheritOption = container.querySelector<HTMLInputElement>(`input[value="${FamilyRecordPolicy.INHERIT}"]`);
    await act(async () => inheritOption?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-policy-save"]')?.click());

    expect(hooks.setPolicy).toHaveBeenCalledWith({
      data: { policy: FamilyRecordPolicy.INHERIT, version: 4 },
      householdId: 'household/a',
      recordId: 7,
    });
  });
});

describe('household calendar', () => {
  it('loads records for the selected API calendar date', async () => {
    const { container } = renderPage(
      '/households/household%2Fa/calendar?month=2026-07-01',
      '/households/:householdId/calendar',
      createElement(HouseholdCalendarPage),
    );
    await act(async () => container.querySelector<HTMLButtonElement>('[data-date="2026-07-21"]')?.click());

    expect(hooks.useInfiniteHouseholdRecordsQuery).toHaveBeenLastCalledWith({
      params: {
        filters: { endDate: '2026-07-21', limit: 50, offset: 0, startDate: '2026-07-21' },
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
  });
});
