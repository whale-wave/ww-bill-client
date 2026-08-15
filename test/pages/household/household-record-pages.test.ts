import type { ReactNode } from 'react';
import type { FamilyRecord, Household, HouseholdRecordsPage as HouseholdRecordsResult } from '@/entities/household';
import { Dialog } from 'antd-mobile';
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

const HouseholdRecordsPage = HouseholdHomePage;

const hooks = vi.hoisted(() => ({
  deleteRecord: vi.fn(),
  fetchNextRecords: vi.fn(),
  refetchRecords: vi.fn(),
  refetchRecordPolicy: vi.fn(),
  setPolicy: vi.fn(),
  useHouseholdCalendarQuery: vi.fn(),
  useFamilyRecordPolicyQuery: vi.fn(),
  useHouseholdMembersQuery: vi.fn(),
  useHouseholdRecordQuery: vi.fn(),
  useHouseholdRecordFilterOptionsQuery: vi.fn(),
  useInfiniteHouseholdRecordsQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
  useDeleteRecordMutation: vi.fn(),
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
  useHouseholdRecordFilterOptionsQuery: hooks.useHouseholdRecordFilterOptionsQuery,
  useInfiniteHouseholdRecordsQuery: hooks.useInfiniteHouseholdRecordsQuery,
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
  useSetFamilyRecordPolicyMutation: hooks.useSetFamilyRecordPolicyMutation,
}));

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: hooks.useUserQuery,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useDeleteRecordMutation: hooks.useDeleteRecordMutation,
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
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

const recordsPage: HouseholdRecordsResult = {
  data: [record],
  limit: 100,
  offset: 0,
  summary: { expense: '20.00', income: '0.00', net: '-20.00' },
  total: 1,
};

let cleanup: (() => void) | undefined;

function query<T>(data: T) {
  return { data, isError: false, isLoading: false, records: (data as HouseholdRecordsResult)?.data ?? [], refetch: hooks.refetchRecords };
}

function renderPage(pathname: string, routePath: string, element: ReactNode, previousPath?: string) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: routePath, element },
    { path: '/households/:householdId/records/search', element: createElement('div', null, 'search-target') },
    { path: '/households/:householdId/records/:recordId', element: createElement('div', null, 'detail-target') },
    { path: '/households/:householdId/records/:recordId/policy', element: createElement('div', null, 'policy-target') },
    { path: '/households/:householdId/budgets', element: createElement('div', null, 'budgets-target') },
    { path: '/households/:householdId/calendar', element: createElement('div', null, 'calendar-target') },
    { path: '/households/:householdId/settings', element: createElement('div', null, 'settings-target') },
    { path: '/detail', element: createElement('div', null, 'default-ledger-target') },
    { path: '/bookkeeping', element: createElement('div', null, 'bookkeeping-target') },
    { path: '/ledgers/:ledgerId/records/:recordId', element: createElement('div', null, 'personal-record-target') },
    { path: '/households/:householdId/charts', element: createElement('div', null, 'charts-target') },
    { path: '/households/:householdId', element: createElement('div', null, 'home-target') },
  ].filter((route, index, routes) => routes.findIndex(candidate => candidate.path === route.path) === index), {
    initialEntries: previousPath ? [previousPath, pathname] : [pathname],
  });
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
  hooks.useHouseholdRecordFilterOptionsQuery.mockReturnValue(query({
    capabilities: { category: true, member: true, tag: true },
    categories: [{ id: 1, name: '餐饮' }, { id: 2, name: '交通' }],
    members: [{ nickname: 'Partner', user: { id: 2, name: 'Partner' } }],
    tags: [
      { id: 'tag-a', name: '聚餐', status: 'ACTIVE' },
      { id: 'tag-b', name: '历史', status: 'ARCHIVED' },
    ],
  }));
  hooks.useHouseholdCalendarQuery.mockReturnValue({
    data: { days: [{ countedExpense: '20.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 1, visibleExpense: '20.00', visibleIncome: '0.00' }], month: '2026-07-01' },
    days: [{ countedExpense: '20.00', countedIncome: '0.00', date: '2026-07-21', recordCount: 1, visibleExpense: '20.00', visibleIncome: '0.00' }],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useSetFamilyRecordPolicyMutation.mockReturnValue([hooks.setPolicy, { isLoading: false }]);
  hooks.useDeleteRecordMutation.mockReturnValue([hooks.deleteRecord, { isLoading: false }]);
  hooks.useUserQuery.mockReturnValue({ data: { id: 1 } });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.useRealTimers();
});

describe('household records', () => {
  it('renders the household title, shared header actions, and monthly totals', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-21T12:00:00.000Z'));
    const { container } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    const header = container.querySelector('[data-testid="household-home-header"]');
    const title = header?.querySelector('h1');
    expect(header?.matches('[data-record-overview-header]')).toBe(true);
    expect(header?.classList).toContain('pt-[max(8px,env(safe-area-inset-top))]');
    expect(title?.textContent).toBe('home.title');
    expect(title?.parentElement?.classList).toContain('gap-2');
    expect(title?.classList).toContain('text-left');
    expect(title?.classList).toContain('truncate');
    expect(header?.querySelector('[data-record-overview-metrics]')).not.toBeNull();
    expect(header?.querySelector('[data-testid="household-more-action"]')).not.toBeNull();
    expect(header?.querySelector('[data-testid="household-exit-action"]')).not.toBeNull();
    expect(header?.querySelector('[data-testid="household-search-action"]')).not.toBeNull();
    expect(header?.querySelector('[data-testid="household-calendar-action"]')).not.toBeNull();
    expect(header?.querySelector('[data-testid="household-record-month-picker"]')?.textContent).toContain('07');
    expect(header?.querySelector('[data-testid="household-monthly-income"]')?.textContent).toContain('0.00');
    expect(header?.querySelector('[data-testid="household-monthly-expense"]')?.textContent).toContain('20.00');
    expect(container.textContent).not.toContain('common.net');
  });

  it('uses the shared month picker trigger', () => {
    const { container } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    const picker = container.querySelector('[data-testid="household-record-month-picker"]');
    expect(picker?.textContent).toContain('common:time.month');
    expect(picker?.tagName).toBe('BUTTON');
  });

  it('keeps household-scoped routes on every home shortcut', async () => {
    const { container, router } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    expect(container.querySelector('[data-testid="household-shortcuts-card"]')).not.toBeNull();
    const shortcuts = [
      ['records', '/households/household%2Fa/records/bill'],
      ['budget', '/households/household%2Fa/budgets'],
      ['settings', '/households/household%2Fa/settings'],
    ] as const;

    for (const [shortcut, path] of shortcuts) {
      await act(async () => container.querySelector<HTMLButtonElement>(`[data-testid="household-${shortcut}"]`)?.click());
      expect(router.state.location.pathname).toBe(path);
      await act(async () => router.navigate('/households/household%2Fa'));
    }

    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-search-action"]')?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/search');
    await act(async () => router.navigate('/households/household%2Fa'));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="household-calendar-action"]')?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/calendar');
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
    expect(recordRow?.classList).toContain('h-16');
    expect(recordRow?.classList).not.toContain('min-h-[60px]');
    expect(amount?.classList).toContain('text-[#c04870]');
    expect(incomeAmount?.textContent).toBe('100.00');
    expect(container.querySelector('[data-date-group="2026-07-20"]')?.textContent).toContain('records.dailyIncome');
    expect(container.querySelector('[data-category-icon="catering"] svg')?.classList).toContain('lucide-utensils');
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
      '/households/household%2Fa/records/search?q=%E9%A4%90',
      '/households/:householdId/records/search',
      createElement(HouseholdRecordSearchPage),
    );

    const list = container.querySelector('[data-testid="record-overview-list"]');
    const row = container.querySelector('[data-record-id="7"]');
    expect(list?.getAttribute('data-record-list-variant')).toBe('search');
    expect(row?.classList).toContain('h-[59px]');
  });

  it('uses the shared fixed search header and keeps advanced household filters in its optional panel', async () => {
    hooks.useHouseholdMembersQuery.mockReturnValue(query([
      { id: 'member-2', nickname: 'Partner', user: { id: 2, name: 'Partner' } },
    ]));
    const { container, router } = renderPage(
      `/households/household%2Fa/records/search?keyword=%E9%A4%90&type=sub&memberUserId=2&startDate=2026-07-01&endDate=2026-07-31&categoryIds=1,2&tagIds=tag-a,tag-b&minAmount=10&maxAmount=90&policy=${FamilyRecordPolicy.SHARED_COUNTED}&countedOnly=true`,
      '/households/:householdId/records/search',
      createElement(HouseholdRecordSearchPage),
    );

    const header = container.querySelector('[data-record-search-header]');
    const shell = container.querySelector('[data-record-search-page-shell]');
    expect(header?.classList).toContain('bg-primary');
    expect(shell?.classList).not.toContain('bg-bg-gray');
    expect(header?.querySelector<HTMLInputElement>('input')?.value).toBe('餐');
    expect(container.querySelector('[data-record-filter-panel]')).toBeNull();

    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="record-filter-action"]')?.click());
    const filterPanel = container.querySelector<HTMLElement>('[data-record-filter-panel]');
    expect(filterPanel).not.toBeNull();
    expect(filterPanel?.textContent).toContain('更多筛选');
    await act(async () => [...filterPanel?.querySelectorAll<HTMLButtonElement>('button') ?? []]
      .find(button => button.textContent?.includes('更多筛选'))
      ?.click());
    expect(container.querySelector('[data-record-filter-more]')).not.toBeNull();
    await act(async () => [...filterPanel?.querySelectorAll<HTMLButtonElement>('button') ?? []]
      .find(button => button.textContent === '确定')
      ?.click());
    expect(Object.fromEntries(new URLSearchParams(router.state.location.search))).toEqual({
      categoryIds: '1,2',
      countedOnly: 'true',
      endDate: '2026-07-31',
      q: '餐',
      maxAmount: '90',
      memberUserId: '2',
      minAmount: '10',
      startDate: '2026-07-01',
      tagIds: 'tag-a,tag-b',
      type: 'sub',
    });
  });

  it('opens an encoded household detail route from a search result', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa/records/search?keyword=%E9%A4%90',
      '/households/:householdId/records/search',
      createElement(HouseholdRecordSearchPage),
    );

    await act(async () => container.querySelector<HTMLElement>('[data-record-id="7"]')?.click());

    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/7');
  });

  it.each([
    ['loading', { data: undefined, isError: false, isLoading: true, refetch: vi.fn() }, 'loading'],
    ['error', { data: undefined, isError: true, isLoading: false, refetch: vi.fn() }, 'error'],
  ])('keeps a working search back control during scope %s', async (_state, scopeQuery, stateTestId) => {
    hooks.useMyHouseholdQuery.mockReturnValue(scopeQuery);
    const { container, router } = renderPage(
      '/households/household%2Fa/records/search',
      '/households/:householdId/records/search',
      createElement(HouseholdRecordSearchPage),
      '/households/previous',
    );

    const back = container.querySelector<HTMLElement>('[data-record-search-header] button[aria-label="返回"]');
    expect(container.querySelector(`[data-record-search-state="${stateTestId}"]`)).not.toBeNull();
    expect(back).not.toBeNull();

    await act(async () => back?.click());
    expect(router.state.location.pathname).toBe('/households/previous');
  });

  it('uses the shared grouped record presentation on the standalone records route', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa/records',
      '/households/:householdId/records',
      createElement(HouseholdRecordsPage),
    );

    const recordRow = container.querySelector('[data-record-id="7"]');
    expect(container.querySelector('[data-testid="record-overview-list"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="record-overview-list"]')?.getAttribute('data-record-list-variant')).toBe('overview');
    expect(recordRow?.classList).toContain('h-16');
    expect(recordRow?.textContent).not.toContain('records.memberAttribution');
    expect(container.querySelector('[data-category-icon="餐"] svg')?.classList).toContain('lucide-utensils');
    await act(async () => recordRow?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/7');
  });

  it('uses the decoded URL household id and opens the family record detail', async () => {
    const { container, router } = renderPage('/households/household%2Fa', '/households/:householdId', createElement(HouseholdHomePage));

    expect(hooks.useInfiniteHouseholdRecordsQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ householdId: 'household/a' }),
    }));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-record-id="7"]')?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/7');
  });

  it('keeps the personal detail action placement while extending it with household fields', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa/records/7',
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
    );

    expect(hooks.useHouseholdRecordQuery).toHaveBeenCalledWith({
      params: { householdId: 'household/a', recordId: 7 },
      queryOptions: { enabled: true },
    });
    expect(container.querySelector('[data-record-detail-navigation]')).not.toBeNull();
    expect(container.querySelector('[data-record-detail-presentation]')).not.toBeNull();
    expect(container.querySelector('[data-record-detail-amount]')?.textContent).toContain('20.00');
    expect(container.querySelector('[data-category-icon="餐"] svg')?.classList).toContain('lucide-utensils');
    expect(container.querySelector('.rounded-xl')).toBeNull();
    expect(container.querySelector('[data-record-detail-pin]')?.textContent).toContain('recordDetail.share');
    expect(container.querySelector('[data-record-detail-footer]')).not.toBeNull();
    expect(container.querySelector('[data-record-detail-footer]')?.textContent).toContain('record:detail.edit');
    expect(container.querySelector('[data-record-detail-footer]')?.textContent).toContain('record:detail.delete');
    expect(container.querySelector('[data-record-detail-footer]')?.textContent).not.toContain('recordDetail.share');
    expect(container.querySelector('[data-record-detail-footer]')?.textContent).not.toContain('recordDetail.policy');
    expect(container.textContent).toContain('晚餐');
    expect(container.textContent).toContain('recordDetail.member');
    expect(container.textContent).toContain('recordDetail.counted');
    const policyAction = container.querySelector<HTMLButtonElement>('[data-testid="household-record-policy"]');
    expect(policyAction?.closest('[data-record-detail-row]')).not.toBeNull();
    await act(async () => policyAction?.click());
    expect(router.state.location.pathname).toBe('/households/household%2Fa/records/7/policy');
  });

  it('keeps the category header in the same navigation flow as the default detail page', () => {
    const { container } = renderPage(
      '/households/household%2Fa/records/7',
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
    );
    const presentation = container.querySelector<HTMLElement>('[data-record-detail-presentation]');

    expect(presentation?.querySelector('[data-record-detail-navigation]')).not.toBeNull();
    expect(presentation?.querySelector('[data-record-detail-header]')).not.toBeNull();
  });

  it('does not show the workspace capsule on household record detail', () => {
    const { container } = renderPage(
      '/households/household%2Fa/records/7',
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
    );

    expect(container.querySelector('[data-workspace-capsule]')).toBeNull();
  });

  it('returns from the household records home to the default ledger through the exit action', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa',
      '/households/:householdId',
      createElement(HouseholdHomePage),
    );
    const returnButton = container.querySelector<HTMLButtonElement>(
      '[data-testid="household-exit-action"]',
    );

    expect(returnButton).not.toBeNull();
    await act(async () => returnButton?.click());
    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('uses the bill sprite for an uncategorised family record', () => {
    hooks.useHouseholdRecordQuery.mockReturnValue(query({
      ...record,
      category: undefined,
    }));
    const { container } = renderPage(
      '/households/household%2Fa/records/7',
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
    );

    expect(container.querySelector('[data-category-icon="bill"] svg')?.classList).toContain('lucide-receipt-text');
  });

  it('opens the default bookkeeping edit flow from an owned household record', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa/records/7',
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
    );
    const editAction = [...container.querySelectorAll<HTMLButtonElement>('[data-record-detail-footer] button')]
      .find(button => button.textContent === 'record:detail.edit');

    await act(async () => editAction?.click());

    expect(router.state.location.pathname).toBe('/bookkeeping');
    expect(router.state.location.state).toEqual({
      recordEditor: {
        initialRecord: expect.objectContaining({
          amount: '20.00',
          id: 7,
          remark: '晚餐',
          type: 'sub',
          version: 2,
        }),
        returnContext: {
          householdId: 'household/a',
          kind: 'household-detail',
          recordId: 7,
        },
      },
    });
  });

  it('deletes an owned household record through the default confirmed action', async () => {
    hooks.deleteRecord.mockResolvedValue({ data: null, message: 'deleted', statusCode: 200 });
    vi.spyOn(Dialog, 'confirm').mockResolvedValue(true);
    const { container, router } = renderPage(
      '/households/household%2Fa/records/7',
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
    );
    const deleteAction = [...container.querySelectorAll<HTMLButtonElement>('[data-record-detail-footer] button')]
      .find(button => button.textContent === 'record:detail.delete');

    await act(async () => deleteAction?.click());

    expect(hooks.deleteRecord).toHaveBeenCalledWith({ id: '7', version: 2 });
    expect(router.state.location.pathname).toBe('/households/household%2Fa');
  });

  it.each([
    [
      'loading',
      '/households/household%2Fa/records/7',
      { data: undefined, isError: false, isLoading: true, refetch: hooks.refetchRecords },
      'household-loading',
    ],
    [
      'error',
      '/households/household%2Fa/records/7',
      { data: undefined, isError: true, isLoading: false, refetch: hooks.refetchRecords },
      'household-error',
    ],
    [
      'invalid',
      '/households/household%2Fa/records/not-a-record',
      { data: undefined, isError: false, isLoading: true, refetch: hooks.refetchRecords },
      'household-error',
    ],
  ])('keeps a working detail back control during the %s state', async (_state, pathname, recordQuery, stateTestId) => {
    hooks.useHouseholdRecordQuery.mockReturnValue(recordQuery);
    const { container, router } = renderPage(
      pathname,
      '/households/:householdId/records/:recordId',
      createElement(HouseholdRecordDetailPage),
      '/households/previous',
    );

    const back = container.querySelector<HTMLElement>('.bwm-nav-bar-back');
    expect(container.querySelector(`[data-testid="${stateTestId}"]`)).not.toBeNull();
    expect(back).not.toBeNull();

    await act(async () => back?.click());
    expect(router.state.location.pathname).toBe('/households/previous');
  });

  it('maps search URL filters directly into the records query', () => {
    renderPage(
      `/households/household%2Fa/records/search?keyword=%E9%A4%90&type=sub&memberUserId=2&startDate=2026-07-01&endDate=2026-07-31&categoryIds=1,2&tagIds=tag-a,tag-b&minAmount=10&maxAmount=90&policy=${FamilyRecordPolicy.SHARED_COUNTED}&countedOnly=true`,
      '/households/:householdId/records/search',
      createElement(HouseholdRecordSearchPage),
    );

    expect(hooks.useInfiniteHouseholdRecordsQuery).toHaveBeenCalledWith({
      params: {
        filters: {
          categoryIds: [1, 2],
          countedOnly: true,
          dateMode: 'range',
          endDate: '2026-07-31',
          keyword: '餐',
          keywordTarget: 'all',
          limit: 50,
          maxAmount: '90',
          memberUserId: 2,
          minAmount: '10',
          offset: 0,
          startDate: '2026-07-01',
          tagIds: ['tag-a', 'tag-b'],
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
  it('uses the record calendar layout with household calendar totals', () => {
    const { container } = renderPage(
      '/households/household%2Fa/calendar?month=2026-07-01',
      '/households/:householdId/calendar',
      createElement(HouseholdCalendarPage),
    );

    expect(container.querySelector('[data-testid="household-calendar-page"] [data-record-calendar-presentation]')).not.toBeNull();
    expect(container.querySelector('.adm-calendar-picker-view')).not.toBeNull();
    expect(container.querySelector('[data-date="2026-07-21"]')?.textContent).toContain('-20');
    expect(hooks.useHouseholdCalendarQuery).toHaveBeenCalledWith({
      params: { householdId: 'household/a', month: '2026-07-01' },
      queryOptions: { enabled: true },
    });
  });

  it('loads records for the selected API calendar date', async () => {
    const { container, router } = renderPage(
      '/households/household%2Fa/calendar?month=2026-07-01',
      '/households/:householdId/calendar',
      createElement(HouseholdCalendarPage),
    );
    await act(async () => container.querySelector<HTMLElement>('[data-date="2026-07-21"]')?.click());

    expect(hooks.useInfiniteHouseholdRecordsQuery).toHaveBeenLastCalledWith({
      params: {
        filters: { endDate: '2026-07-21', limit: 50, offset: 0, startDate: '2026-07-21' },
        householdId: 'household/a',
      },
      queryOptions: { enabled: true },
    });
    expect(router.state.location.search).toMatch(/^\?selectTime=\d+$/);
    expect(router.state.location.search).not.toContain('month=');
  });

  it('opens the personal editor with a safe household return context', async () => {
    const selectTime = new Date('2026-07-21T12:00:00.000Z').valueOf();
    const { container, router } = renderPage(
      `/households/household%2Fa/calendar?selectTime=${selectTime}`,
      '/households/:householdId/calendar',
      createElement(HouseholdCalendarPage),
    );

    await act(async () => container.querySelector<HTMLElement>('.adm-floating-bubble-button')?.click());

    expect(router.state.location.pathname).toBe('/bookkeeping');
    expect(router.state.location.search).toBe(`?selectTime=${selectTime}`);
    expect(router.state.location.state).toEqual({
      recordEditor: {
        returnContext: {
          householdId: 'household/a',
          kind: 'household-calendar',
          selectTime,
        },
      },
    });
  });
});
