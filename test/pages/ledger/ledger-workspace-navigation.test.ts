import type { ReactNode } from 'react';
import type { Ledger, LedgerListItem, LedgerTemplate } from '@/entities/ledger';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActionSheet, Dialog, Modal } from 'antd-mobile';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetEntityType } from '@/entities/budget';
import {
  LedgerCapability,
  LedgerKind,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import BillPage from '@/pages/bill/BillPage';
import BudgetPage from '@/pages/budget/BudgetPage';
import ChartHomePage from '@/pages/chart/chart-home/ChartHomePage';
import LedgerBudgetPage from '@/pages/ledger-budget/LedgerBudgetPage';
import LedgerChartsPage from '@/pages/ledger-charts/LedgerChartsPage';
import LedgerCreatePage from '@/pages/ledger-create/LedgerCreatePage';
import LedgerRecordCreatePage from '@/pages/ledger-record-create/LedgerRecordCreatePage';
import LedgerRecordSearchPage from '@/pages/ledger-record-search/LedgerRecordSearchPage';
import LedgerRecordsPage from '@/pages/ledger-records/LedgerRecordsPage';
import DetailPage from '@/pages/record/detail/DetailPage';

const hooks = vi.hoisted(() => ({
  clearLedgerBudget: vi.fn(),
  createLedgerBudgetSummary: vi.fn(),
  createLedger: vi.fn(),
  createLedgerRecord: vi.fn(),
  useClearLedgerBudgetMutation: vi.fn(),
  useCreateLedgerBudgetCategoryMutation: vi.fn(),
  useCreateLedgerMutation: vi.fn(),
  useCreateLedgerRecordMutation: vi.fn(),
  useCreateLedgerBudgetSummaryMutation: vi.fn(),
  useDeleteLedgerBudgetCategoryMutation: vi.fn(),
  useDeleteBudgetCategoryByBudgetIdMutation: vi.fn(),
  useGetBudgetInfoQuery: vi.fn(),
  useGetChartQuery: vi.fn(),
  useGetRecordBillQuery: vi.fn(),
  useGetUserAppConfigQuery: vi.fn(),
  useLedgerBudgetInfoQuery: vi.fn(),
  useLedgerCategoriesQuery: vi.fn(),
  useLedgerChartQuery: vi.fn(),
  useLedgerNavigationQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerRecordBillQuery: vi.fn(),
  useLedgerRecordsQuery: vi.fn(),
  useRecordFilterOptionsQuery: vi.fn(),
  useLedgerTagsQuery: vi.fn(),
  useLedgerTemplatesQuery: vi.fn(),
  useMyHouseholdQuery: vi.fn(),
  usePostBudgetClearMutation: vi.fn(),
  usePatchLedgerBudgetAmountMutation: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useCreateLedgerMutation: hooks.useCreateLedgerMutation,
  useLedgerNavigationQuery: hooks.useLedgerNavigationQuery,
  useLedgerPreferencesQuery: hooks.useLedgerPreferencesQuery,
  useLedgerQuery: hooks.useLedgerQuery,
  useLedgerTemplatesQuery: hooks.useLedgerTemplatesQuery,
}));

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: hooks.useGetUserAppConfigQuery,
}));

vi.mock('@/entities/household', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/household')>()),
  useMyHouseholdQuery: hooks.useMyHouseholdQuery,
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useGetRecordBillQuery: hooks.useGetRecordBillQuery,
  useLedgerRecordBillQuery: hooks.useLedgerRecordBillQuery,
  useLedgerRecordsQuery: hooks.useLedgerRecordsQuery,
  useRecordFilterOptionsQuery: hooks.useRecordFilterOptionsQuery,
  useCreateLedgerRecordMutation: hooks.useCreateLedgerRecordMutation,
}));

vi.mock('@/entities/chart', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/chart')>()),
  useGetChartQuery: hooks.useGetChartQuery,
  useLedgerChartQuery: hooks.useLedgerChartQuery,
}));

vi.mock('@/entities/budget', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/budget')>()),
  useClearLedgerBudgetMutation: hooks.useClearLedgerBudgetMutation,
  useCreateLedgerBudgetCategoryMutation: hooks.useCreateLedgerBudgetCategoryMutation,
  useCreateLedgerBudgetSummaryMutation: hooks.useCreateLedgerBudgetSummaryMutation,
  useDeleteLedgerBudgetCategoryMutation: hooks.useDeleteLedgerBudgetCategoryMutation,
  useDeleteBudgetCategoryByBudgetIdMutation: hooks.useDeleteBudgetCategoryByBudgetIdMutation,
  useGetBudgetInfoQuery: hooks.useGetBudgetInfoQuery,
  useLedgerBudgetInfoQuery: hooks.useLedgerBudgetInfoQuery,
  usePatchLedgerBudgetAmountMutation: hooks.usePatchLedgerBudgetAmountMutation,
  usePostBudgetClearMutation: hooks.usePostBudgetClearMutation,
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useLedgerCategoriesQuery: hooks.useLedgerCategoriesQuery,
}));

vi.mock('@/entities/ledger-data', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger-data')>()),
  useLedgerTagsQuery: hooks.useLedgerTagsQuery,
}));

vi.mock('@/pages/record/detail/List', () => ({ default: () => createElement('div', { 'data-testid': 'personal-record-list' }) }));
vi.mock('@/pages/record/model/useRecordList', () => ({
  useRecordList: () => ({
    amounts: [['2', '00'], ['5', '00']],
    isError: false,
    isLoading: false,
    record: [],
    refetch: vi.fn(),
  }),
}));
vi.mock('@/pages/record/model/useVisibleAmount', () => ({
  useVisibleAmount: () => ({
    isVisibleAmount: true,
    onToggleVisibleAmount: vi.fn(),
    visibleAmount: true,
    visibleAmountSwitch: false,
  }),
}));
vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({ chartDomRef: { current: null }, myChart: { setOption: vi.fn() } }),
}));

vi.mock('@/shared/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
  useTranslation: () => ({
    t: (key: string, values?: { count?: number }) => ({
      'amount.expend': '支出',
      'calendar.title': '日历',
      'common:dateTime.yearSuffix': '年',
      'common:nav.back': '返回',
      'dropdown.monthlyBudget': '月预算',
      'dropdown.yearlyBudget': '年预算',
      'monthlyBill': '月账单',
      'search.title': '搜索',
      'records.calendar': '日历',
      'records.search': '搜索',
      'switcher.cancel': '取消',
      'switcher.create': '创建账本',
      'switcher.currentCustom': '当前账本',
      'switcher.currentPersonal': '当前为默认账本',
      'switcher.currentSettings': '当前账本设置',
      'switcher.customEmpty': '还没有自定义账本',
      'switcher.loadError': '账本列表加载失败',
      'switcher.loadErrorDescription': '请检查网络后重试',
      'switcher.manage': '账本管理',
      'switcher.memberCount': `${values?.count ?? 0} 人`,
      'switcher.more': '更多账本操作',
      'switcher.personal': '默认账本',
      'switcher.preferences': '快捷入口设置',
      'switcher.recordCount': `${values?.count ?? 0} 笔记录`,
      'switcher.retry': '重新加载',
      'switcher.returnPersonal': '返回默认账本',
      'switcher.switch': '切换账本',
      'template.business.name': '生意账本',
    })[key] ?? key,
  }),
}));

const ledger: Ledger = {
  capabilities: [
    LedgerCapability.LEDGER_READ,
    LedgerCapability.RECORD_READ,
    LedgerCapability.RECORD_CREATE,
    LedgerCapability.BUDGET_READ,
    LedgerCapability.BUDGET_MANAGE,
    LedgerCapability.CHART_READ,
  ],
  createdAt: '2026-07-22T00:00:00.000Z',
  createdByUserId: 7,
  iconKey: 'wallet',
  id: 'ledger/a',
  kind: LedgerKind.CUSTOM,
  monthStartDay: 1,
  myRole: LedgerRole.OWNER,
  name: '家庭旅行账本',
  ownerUserId: 7,
  status: LedgerStatus.ACTIVE,
  themeKey: 'green',
  updatedAt: '2026-07-22T00:00:00.000Z',
  version: 2,
};

function navigationLedger(overrides: Partial<LedgerListItem>): LedgerListItem {
  return {
    ...ledger,
    activeMemberCount: 1,
    myMembership: { id: 'member-a', sortOrder: 0, version: 1 },
    recordCount: 0,
    ...overrides,
  };
}

const templates: LedgerTemplate[] = [{
  categoryProfileKey: 'business-v1',
  defaultName: '生意账本',
  description: '经营收支专用账本',
  iconKey: 'shop',
  key: 'business',
  name: '生意账本',
  themeKey: 'green',
  version: 1,
}];

const billData = {
  all: { balance: 3, expand: 2, income: 5 },
  list: { 7: { balance: 3, expand: 2, income: 5 } },
};

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, path: string, element: ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([
    { element, path },
    { element: createElement('div', null, 'personal-detail-target'), path: '/detail' },
    { element: createElement('div', null, 'personal-search-target'), path: '/search-record' },
    { element: createElement('div', null, 'personal-calendar-target'), path: '/record-calendar' },
    { element: createElement('div', null, 'custom-detail-target'), path: '/ledgers/:ledgerId' },
    { element: createElement('div', null, 'custom-records-target'), path: '/ledgers/:ledgerId/records' },
  ], { initialEntries: ['/origin', pathname], initialIndex: 1 });
  const queryClient = new QueryClient();
  act(() => root.render(createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(RouterProvider, { router }),
  )));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, router };
}

async function click(element: Element | null | undefined) {
  expect(element).not.toBeNull();
  await act(async () => {
    (element as HTMLElement).click();
    await Promise.resolve();
  });
}

function cleanupRender() {
  const current = cleanup;
  cleanup = undefined;
  current?.();
  document.body.innerHTML = '';
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useGetUserAppConfigQuery.mockReturnValue({
    data: { isLedgerQuickSwitchEnabled: true, ledgerQuickSwitchVersion: 1 },
    isError: false,
    isLoading: false,
  });
  hooks.useLedgerNavigationQuery.mockReturnValue({
    data: [
      navigationLedger({ id: 'private-default-id', kind: LedgerKind.SYSTEM_DEFAULT, name: '系统默认账本', recordCount: 8 }),
      navigationLedger({ id: ledger.id, name: ledger.name }),
    ],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useLedgerQuery.mockReturnValue({ data: ledger, error: undefined, isError: false, isLoading: false, refetch: vi.fn() });
  hooks.useMyHouseholdQuery.mockReturnValue({
    data: undefined,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useLedgerPreferencesQuery.mockReturnValue({ data: undefined, isError: false, isLoading: false });
  hooks.useLedgerRecordsQuery.mockReturnValue({ data: { data: [], expend: 2, income: 5, total: 0 }, isError: false, isLoading: false });
  hooks.useRecordFilterOptionsQuery.mockReturnValue({
    data: {
      capabilities: { category: true, tag: true },
      categories: [],
      tags: [],
    },
    isError: false,
    isLoading: false,
  });
  hooks.useGetRecordBillQuery.mockReturnValue({ data: billData, isError: false, isLoading: false });
  hooks.useLedgerRecordBillQuery.mockReturnValue({ data: billData, isError: false, isLoading: false });
  hooks.useGetChartQuery.mockReturnValue({ data: [], isError: false, isLoading: false });
  hooks.useLedgerChartQuery.mockReturnValue({ data: [], isError: false, isLoading: false });
  hooks.useGetBudgetInfoQuery.mockReturnValue({ data: { categoryBudgets: [] }, isError: false, isLoading: false });
  hooks.useLedgerBudgetInfoQuery.mockReturnValue({ data: { categoryBudgets: [] }, isError: false, isLoading: false });
  hooks.useLedgerCategoriesQuery.mockReturnValue({ data: [], isError: false, isLoading: false, refetch: vi.fn() });
  hooks.useLedgerTagsQuery.mockReturnValue({ data: [], isError: false, isLoading: false });
  hooks.useCreateLedgerRecordMutation.mockReturnValue([hooks.createLedgerRecord, { isLoading: false }]);
  hooks.useClearLedgerBudgetMutation.mockReturnValue([hooks.clearLedgerBudget, { isLoading: false }]);
  hooks.useCreateLedgerBudgetCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useCreateLedgerBudgetSummaryMutation.mockReturnValue([hooks.createLedgerBudgetSummary, { isLoading: false }]);
  hooks.useDeleteLedgerBudgetCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.usePatchLedgerBudgetAmountMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useDeleteBudgetCategoryByBudgetIdMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.usePostBudgetClearMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useLedgerTemplatesQuery.mockReturnValue({ data: templates, isError: false, isLoading: false, refetch: vi.fn() });
  hooks.useCreateLedgerMutation.mockReturnValue([hooks.createLedger, { isLoading: false }]);
});

afterEach(() => {
  vi.useRealTimers();
  cleanupRender();
});

describe('personal ledger workspace integration', () => {
  it('restores the switchable centered title, direct header actions, and original shortcuts', async () => {
    const { container, router } = renderPage('/detail', '/detail', createElement(DetailPage));
    const header = container.querySelector('[data-testid="record-overview-header"]');
    const periodControl = container.querySelector('[data-testid="record-period-control"]');
    const title = container.querySelector('[data-testid="ledger-switcher-title"]');
    const searchAction = container.querySelector('[data-testid="record-search-action"]');
    const calendarAction = container.querySelector('[data-testid="record-calendar-action"]');
    const shortcutButtons = header?.querySelectorAll('[aria-label="record shortcuts"] button') ?? [];

    expect(header).not.toBeNull();
    expect(title?.parentElement?.classList).toContain('gap-2');
    expect(periodControl?.tagName).toBe('DIV');
    expect(periodControl?.querySelector('[data-testid="record-month-picker"]')?.tagName).toBe('BUTTON');
    expect(title?.textContent).toContain('鲸浪账本');
    expect(title?.tagName).toBe('BUTTON');
    expect(title?.className).toContain('text-center');
    expect(title?.className).not.toContain('text-left');
    expect(container.querySelector('[data-workspace-capsule]')).toBeNull();
    expect(searchAction?.parentElement).toBe(calendarAction?.parentElement);
    expect(searchAction?.parentElement?.parentElement?.parentElement).toBe(header);
    expect(shortcutButtons).toHaveLength(3);
    expect(Array.from(shortcutButtons).map(button => button.textContent)).toEqual([
      'bill:title',
      'budget:title',
      'common:commonFunctions.assetSteward',
    ]);

    await click(searchAction);
    expect(router.state.location.pathname).toBe('/search-record');
  });

  it.each([
    ['chart', '/chart', createElement(ChartHomePage), '支出', false, true],
    ['budget', '/budget', createElement(BudgetPage), '月预算', true, false],
    ['bill', '/bill', createElement(BillPage), '月账单', false, false],
  ])('keeps the original %s navigation contract', (_name, pathname, element, businessTitle, hasTopBack, hasTabBar) => {
    const { container } = renderPage(pathname, pathname, element);

    expect(container.querySelector('[data-testid="mini-program-capsule"]')).toBeNull();
    expect(container.textContent).toContain(businessTitle);
    expect(container.querySelector('.bwm-nav-bar-back') !== null).toBe(hasTopBack);
    expect(container.querySelector('.bwm-tab-bar') !== null).toBe(hasTabBar);
  });

  it('keeps year selection, month/year bill switching, and the bottom return action', async () => {
    const { container, router } = renderPage('/bill', '/bill', createElement(BillPage));
    const periodTabs = container.querySelectorAll('.bill-period-tabs > button');
    const scrollContainer = container.querySelector<HTMLElement>('[data-testid="bill-scroll-container"]');

    expect(container.querySelector('[data-testid="bill-year-selector"]')?.textContent).toContain('2026年');
    expect(container.textContent).toContain('月账单');
    expect(container.querySelector('.bwm-button-full')).not.toBeNull();
    expect(periodTabs).toHaveLength(2);

    if (scrollContainer)
      scrollContainer.scrollTop = 180;
    await click(periodTabs[1]);
    await vi.waitFor(() => expect(
      container.querySelector<HTMLElement>('[data-testid="bill-year-selector"]')?.getAttribute('aria-hidden'),
    ).toBe('true'));
    expect(scrollContainer?.scrollTop).toBe(0);
    await click(container.querySelector('.bwm-button-full'));
    expect(router.state.location.pathname).toBe('/origin');
  });

  it('changes personal chart amount and range filters through the restored controls', async () => {
    const { container, router } = renderPage('/chart', '/chart', createElement(ChartHomePage));
    const ranges = container.querySelectorAll('.chart-period-tabs > button');

    expect(ranges).toHaveLength(3);
    await click(ranges[2]);
    expect(router.state.location.search).toContain('range=year');

    await click(container.querySelector('[data-chart-amount-type="add"]'));
    expect(router.state.location.search).toContain('amount=add');
    expect(hooks.useGetChartQuery).toHaveBeenLastCalledWith({
      params: { category: 'year', type: 'add' },
    });
  });

  it('changes personal budget period and returns through the restored navbar', async () => {
    const { container, router } = renderPage('/budget', '/budget', createElement(BudgetPage));

    await click(container.querySelector('.adm-dropdown-item-title'));
    await click(document.querySelector('[data-budget-type="1"]'));
    expect(hooks.useGetBudgetInfoQuery).toHaveBeenLastCalledWith({ params: { type: 1 } });

    await click(container.querySelector('.bwm-nav-bar-back'));
    expect(router.state.location.pathname).toBe('/origin');
  });
});

describe('custom ledger workspace integration', () => {
  it('uses the personal search shell and canonicalizes the legacy keyword parameter', async () => {
    hooks.useLedgerRecordsQuery.mockReturnValue({
      data: {
        data: [{
          amount: '20.00',
          category: {
            createdAt: '2026-07-01T00:00:00.000Z',
            icon: 'meal',
            id: 1,
            name: '餐饮',
            updatedAt: '2026-07-01T00:00:00.000Z',
          },
          createdAt: '2026-07-21T12:00:00.000Z',
          id: 7,
          remark: '晚餐',
          time: '2026-07-21T12:00:00.000Z',
          type: 'sub',
          updatedAt: '2026-07-21T12:00:00.000Z',
          version: 1,
        }],
        expend: 20,
        income: 0,
        total: 1,
      },
      isError: false,
      isLoading: false,
    });
    const { container, router } = renderPage(
      '/ledgers/ledger%2Fa/records/search?keyword=%E6%99%9A%E9%A4%90',
      '/ledgers/:ledgerId/records/search',
      createElement(LedgerRecordSearchPage),
    );

    expect(container.querySelector('[data-record-search-page-shell]')).not.toBeNull();
    expect(container.querySelector('[data-record-list-variant="search"]')).not.toBeNull();
    expect(container.querySelector('[data-record-id="7"]')?.classList).toContain('h-[59px]');
    expect(hooks.useLedgerRecordsQuery).toHaveBeenLastCalledWith(expect.objectContaining({
      params: { filters: { keyword: '晚餐', keywordTarget: 'all' }, ledgerId: 'ledger/a' },
    }));

    const input = container.querySelector<HTMLInputElement>('[data-record-search-input] input');
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      setValue?.call(input, '午餐');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
    expect(router.state.location.search).toContain('q=%E5%8D%88%E9%A4%90');
    expect(router.state.location.search).not.toContain('keyword=');
  });

  it('uses the current ledger name without a redundant capsule and preserves ledger-scoped tabs', () => {
    hooks.useLedgerRecordsQuery.mockReturnValue({
      data: {
        data: [{
          amount: '20.00',
          category: {
            createdAt: '2026-07-01T00:00:00.000Z',
            icon: 'catering',
            id: 1,
            name: '餐饮',
            updatedAt: '2026-07-01T00:00:00.000Z',
          },
          createdAt: '2026-07-21T12:00:00.000Z',
          id: 7,
          remark: '晚餐',
          time: '2026-07-21T12:00:00.000Z',
          type: 'sub',
          updatedAt: '2026-07-21T12:00:00.000Z',
          version: 1,
        }],
        expend: 20,
        income: 0,
        total: 1,
      },
      isError: false,
      isLoading: false,
    });
    const first = renderPage('/ledgers/ledger%2Fa/records', '/ledgers/:ledgerId/records', createElement(LedgerRecordsPage));

    expect(first.container.querySelector('[data-record-overview-header]')).not.toBeNull();
    expect(first.container.querySelector('[data-testid="ledger-record-shortcuts"]')).not.toBeNull();
    const customShortcuts = first.container.querySelectorAll('[aria-label="record shortcuts"] button');
    expect(customShortcuts).toHaveLength(5);
    expect(Array.from(customShortcuts).every(shortcut => (
      shortcut.classList.contains('min-w-0')
      && shortcut.classList.contains('flex-1')
    ))).toBe(true);
    expect(first.container.querySelector('[data-testid="record-overview-list"]')).not.toBeNull();
    expect(first.container.querySelector('[data-record-list-variant="overview"]')).not.toBeNull();
    expect(first.container.querySelector('[data-date-group="2026-07-21"]')).not.toBeNull();
    expect(first.container.querySelector('[data-category-icon="catering"] svg')?.classList).toContain('lucide-utensils');
    expect(['bill', 'budget', 'settings']
      .every(shortcut => first.container.querySelector(`[data-testid="ledger-${shortcut}"]`))).toBe(true);
    expect(first.container.querySelector('[data-testid="ledger-search-action"]')).not.toBeNull();
    expect(first.container.querySelector('[data-testid="ledger-calendar-action"]')).not.toBeNull();
    expect(first.container.querySelector('.adm-search-bar')).toBeNull();
    expect(first.container.querySelector('.record-overview-title')?.textContent).toContain('家庭旅行账本');
    expect(first.container.querySelector('.record-overview-title')?.tagName).toBe('H1');
    expect(first.container.querySelector('[data-workspace-capsule]')).not.toBeNull();
    expect(hooks.useLedgerRecordsQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: {
        filters: {
          endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          startDate: expect.stringMatching(/^\d{4}-\d{2}-01$/),
        },
        ledgerId: 'ledger/a',
      },
    }));
    expect(Array.from(first.container.querySelectorAll<HTMLElement>('[data-tab-key]')).map(item => item.dataset.route)).toEqual([
      '/ledgers/ledger%2Fa/records',
      '/ledgers/ledger%2Fa/records/new',
      '/ledgers/ledger%2Fa/charts',
    ]);

    cleanupRender();
    hooks.useGetUserAppConfigQuery.mockReturnValue({
      data: { isLedgerQuickSwitchEnabled: false, ledgerQuickSwitchVersion: 1 },
      isError: false,
      isLoading: false,
    });
    const second = renderPage('/ledgers/ledger%2Fa/records', '/ledgers/:ledgerId/records', createElement(LedgerRecordsPage));
    expect(second.container.querySelector('.record-overview-title')?.tagName).toBe('H1');
    expect(second.container.querySelector('[data-workspace-capsule]')).not.toBeNull();
  });

  it('does not mount the records adapter when record read permission is denied', () => {
    hooks.useLedgerQuery.mockReturnValue({
      data: { ...ledger, capabilities: [] },
      error: undefined,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    hooks.useLedgerRecordsQuery.mockClear();

    const { container } = renderPage(
      '/ledgers/ledger%2Fa/records',
      '/ledgers/:ledgerId/records',
      createElement(LedgerRecordsPage),
    );

    expect(hooks.useLedgerRecordsQuery).not.toHaveBeenCalled();
    expect(container.textContent).toContain('common.noPermission');
  });

  it('keeps the search shell while showing a record-query error', () => {
    hooks.useLedgerRecordsQuery.mockReturnValue({
      data: { data: [], expend: 0, income: 0, total: 0 },
      isError: true,
      isLoading: false,
    });
    const { container } = renderPage(
      '/ledgers/ledger%2Fa/records/search?keyword=%E6%99%9A%E9%A4%90',
      '/ledgers/:ledgerId/records/search',
      createElement(LedgerRecordSearchPage),
    );

    expect(container.querySelector('[data-record-search-page-shell]')).not.toBeNull();
    expect(container.querySelector('[data-record-search-state="error"]')).not.toBeNull();
  });

  it('returns from the custom records home to the default ledger through the capsule', async () => {
    const { container, router } = renderPage('/ledgers/ledger%2Fa/records', '/ledgers/:ledgerId/records', createElement(LedgerRecordsPage));
    const returnButton = container.querySelector<HTMLButtonElement>(
      '[data-workspace-capsule] button[aria-label="返回默认账本"]',
    );

    expect(returnButton).not.toBeNull();
    await click(returnButton);
    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it.each([
    ['charts', '/ledgers/ledger%2Fa/charts', '/ledgers/:ledgerId/charts', createElement(LedgerChartsPage), true],
    ['budget', '/ledgers/ledger%2Fa/budget', '/ledgers/:ledgerId/budget', createElement(LedgerBudgetPage), false],
  ])('keeps custom %s business navigation explicit', (_name, pathname, path, element, hasWorkspaceTabBar) => {
    const { container } = renderPage(pathname, path, element);

    expect(container.querySelector('[data-testid="ledger-switcher-title"]')).toBeNull();
    expect(container.querySelector('.ww-ledger-workspace-tab-bar') !== null).toBe(hasWorkspaceTabBar);
    expect(container.querySelector('.adm-nav-bar-back, .bwm-nav-bar-back') !== null).toBe(!hasWorkspaceTabBar);
  });

  it('returns a custom budget to the previous route', async () => {
    const { container, router } = renderPage(
      '/ledgers/ledger%2Fa/budget',
      '/ledgers/:ledgerId/budget',
      createElement(LedgerBudgetPage),
    );

    await click(container.querySelector('.bwm-nav-bar-back'));
    expect(router.state.location.pathname).toBe('/origin');
  });

  it('uses the personal budget shell and presentation for custom ledgers', () => {
    hooks.useLedgerBudgetInfoQuery.mockReturnValue({
      data: {
        categoryBudgets: [],
        summaryBudget: {
          amount: 100,
          budgetAmount: 1000,
          id: 'ledger-summary',
          remaining: 900,
          remainingPercentage: '90',
        },
      },
      isError: false,
      isLoading: false,
    });
    const { container } = renderPage(
      '/ledgers/ledger%2Fa/budget',
      '/ledgers/:ledgerId/budget',
      createElement(LedgerBudgetPage),
    );

    expect(container.querySelector('[data-budget-page-shell]')).not.toBeNull();
    expect(container.querySelector('[data-budget-id="ledger-summary"]')).not.toBeNull();
    expect(container.querySelector('.adm-dropdown-item-title')).not.toBeNull();
  });

  it.each([
    ['loading', { data: undefined, isError: false, isLoading: true, refetch: vi.fn() }],
    ['error', { data: undefined, error: new Error('scope failed'), isError: true, isLoading: false, refetch: vi.fn() }],
  ])('keeps the budget shell and back navigation during scope %s', (_state, scopeQuery) => {
    hooks.useLedgerQuery.mockReturnValue(scopeQuery);
    hooks.useLedgerBudgetInfoQuery.mockClear();
    const { container } = renderPage(
      '/ledgers/ledger%2Fa/budget',
      '/ledgers/:ledgerId/budget',
      createElement(LedgerBudgetPage),
    );

    expect(container.querySelector('[data-budget-page-shell]')).not.toBeNull();
    expect(container.querySelector('.bwm-nav-bar-back')).not.toBeNull();
    expect(hooks.useLedgerBudgetInfoQuery).not.toHaveBeenCalled();
  });

  it('confirms summary-budget clearing before running the ledger mutation', async () => {
    hooks.useLedgerBudgetInfoQuery.mockReturnValue({
      data: {
        categoryBudgets: [],
        summaryBudget: {
          amount: 100,
          budgetAmount: 1000,
          id: 'ledger-summary',
          remaining: 900,
          remainingPercentage: '90',
        },
      },
      isError: false,
      isLoading: false,
    });
    const actionSheet = vi.spyOn(ActionSheet, 'show').mockReturnValue({ close: vi.fn() });
    const confirm = vi.spyOn(Modal, 'confirm').mockResolvedValue(false);
    const { container } = renderPage(
      '/ledgers/ledger%2Fa/budget',
      '/ledgers/:ledgerId/budget',
      createElement(LedgerBudgetPage),
    );

    act(() => container.querySelector<HTMLElement>('[data-budget-id="ledger-summary"]')?.click());
    const clearAction = actionSheet.mock.calls[0]?.[0].actions.find(action => action.key === 'delete');
    await act(async () => {
      await clearAction?.onClick?.();
    });
    expect(confirm).toHaveBeenCalledWith({ content: 'clearSummaryBudgetWarning', title: 'warning.title' });
    expect(hooks.clearLedgerBudget).not.toHaveBeenCalled();

    confirm.mockResolvedValue(true);
    await act(async () => {
      await clearAction?.onClick?.();
    });
    expect(hooks.clearLedgerBudget).toHaveBeenCalledWith({
      data: {
        periodStart: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        type: BudgetEntityType.MONTH,
      },
      ledgerId: 'ledger/a',
    });
  });

  it('treats budget status 4017 as saved and shows the server warning', async () => {
    vi.useFakeTimers();
    hooks.useLedgerBudgetInfoQuery.mockReturnValue({
      data: { categoryBudgets: [] },
      isError: false,
      isLoading: false,
    });
    hooks.createLedgerBudgetSummary.mockResolvedValue({
      data: {},
      message: 'saved with warning',
      statusCode: 4017,
    });
    const warning = vi.spyOn(Dialog, 'alert').mockResolvedValue(undefined);
    const { container } = renderPage(
      '/ledgers/ledger%2Fa/budget',
      '/ledgers/:ledgerId/budget',
      createElement(LedgerBudgetPage),
    );

    act(() => container.querySelector<HTMLElement>('[data-budget-create-summary]')?.click());
    const input = document.body.querySelector<HTMLInputElement>('input[name="ledgerBudgetAmount"]');
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      setValue?.call(input, '500');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
      await Promise.resolve();
    });
    const save = [...document.body.querySelectorAll<HTMLButtonElement>('.adm-modal-footer button')]
      .find(button => button.textContent === 'actions.save');
    await click(save);
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(hooks.createLedgerBudgetSummary).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ amount: '500' }),
      ledgerId: 'ledger/a',
    }));
    expect(warning).toHaveBeenCalledWith({
      confirmText: 'actions.save',
      content: 'warning.categoryBudgetExceedsTotal',
    });
  });

  it('keeps a failed custom budget request distinct from an empty budget', () => {
    hooks.useLedgerBudgetInfoQuery.mockReturnValue({
      data: { categoryBudgets: [] },
      isError: true,
      isLoading: false,
    });
    const { container } = renderPage(
      '/ledgers/ledger%2Fa/budget',
      '/ledgers/:ledgerId/budget',
      createElement(LedgerBudgetPage),
    );

    expect(container.querySelector('[data-ledger-budget-error]')).not.toBeNull();
    expect(container.querySelector('[data-budget-create-summary]')).toBeNull();
  });

  it('registers a scoped bill page, gates its query, and returns to the previous route', async () => {
    const { default: LedgerBillPage } = await import('@/pages/bill/LedgerBillPage');
    const first = renderPage('/ledgers/ledger%2Fa/bill', '/ledgers/:ledgerId/bill', createElement(LedgerBillPage));

    expect(hooks.useLedgerRecordBillQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ ledgerId: 'ledger/a' }),
    }));
    expect(first.container.querySelector('[data-testid="mini-program-capsule"]')).toBeNull();
    expect(first.container.querySelector('[data-testid="ledger-switcher-title"]')).toBeNull();
    expect(first.container.querySelector('.bwm-button-full')).not.toBeNull();
    await click(first.container.querySelector('.bwm-button-full'));
    expect(first.router.state.location.pathname).toBe('/origin');

    cleanupRender();
    const headerReturn = renderPage('/ledgers/ledger%2Fa/bill', '/ledgers/:ledgerId/bill', createElement(LedgerBillPage));
    await click(headerReturn.container.querySelector('[data-page-header] button'));
    expect(headerReturn.router.state.location.pathname).toBe('/origin');

    cleanupRender();
    hooks.useLedgerRecordBillQuery.mockClear();
    hooks.useLedgerQuery.mockReturnValue({ data: { ...ledger, capabilities: [] }, error: undefined, isError: false, isLoading: false, refetch: vi.fn() });
    const denied = renderPage('/ledgers/ledger%2Fa/bill', '/ledgers/:ledgerId/bill', createElement(LedgerBillPage));
    expect(hooks.useLedgerRecordBillQuery).not.toHaveBeenCalled();
    expect(denied.router.state.location.pathname).toBe('/ledgers/ledger%2Fa/bill');
    expect(denied.container.textContent).toContain('common.noPermission');
  });
});

describe('workspace landing and return contracts', () => {
  it('lands a newly created ledger on its records workspace with replace', async () => {
    hooks.createLedger.mockResolvedValue({ data: { ...ledger, id: 'created/ledger' }, message: 'ok', statusCode: 201 });
    const { container, router } = renderPage('/ledgers/create?template=business', '/ledgers/create', createElement(LedgerCreatePage));
    const form = container.querySelector<HTMLFormElement>('form');

    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(router.state.location.pathname).toBe('/ledgers/created%2Fledger/records');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('returns ledger record creation to the same encoded ledger workspace', async () => {
    const { container, router } = renderPage('/ledgers/ledger%2Fa/records/new', '/ledgers/:ledgerId/records/new', createElement(LedgerRecordCreatePage));

    await click(container.querySelector('[data-record-editor-cancel]'));
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/records');
    expect(router.state.historyAction).toBe('REPLACE');
  });
});
