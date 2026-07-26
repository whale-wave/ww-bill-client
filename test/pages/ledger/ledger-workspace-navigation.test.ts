import type { ReactNode } from 'react';
import type { Ledger, LedgerListItem, LedgerTemplate } from '@/entities/ledger';
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
import BillPage from '@/pages/bill/BillPage';
import BudgetPage from '@/pages/budget/BudgetPage';
import ChartHomePage from '@/pages/chart/chart-home/ChartHomePage';
import LedgerBudgetPage from '@/pages/ledger-budget/LedgerBudgetPage';
import LedgerChartsPage from '@/pages/ledger-charts/LedgerChartsPage';
import LedgerCreatePage from '@/pages/ledger-create/LedgerCreatePage';
import LedgerRecordCreatePage from '@/pages/ledger-record-create/LedgerRecordCreatePage';
import LedgerRecordsPage from '@/pages/ledger-records/LedgerRecordsPage';
import DetailPage from '@/pages/record/detail/DetailPage';

const hooks = vi.hoisted(() => ({
  createLedger: vi.fn(),
  useCreateLedgerMutation: vi.fn(),
  useCreateLedgerBudgetSummaryMutation: vi.fn(),
  useDeleteBudgetCategoryByBudgetIdMutation: vi.fn(),
  useGetBudgetInfoQuery: vi.fn(),
  useGetChartQuery: vi.fn(),
  useGetRecordBillQuery: vi.fn(),
  useGetUserAppConfigQuery: vi.fn(),
  useLedgerBudgetInfoQuery: vi.fn(),
  useLedgerChartQuery: vi.fn(),
  useLedgerNavigationQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerRecordBillQuery: vi.fn(),
  useLedgerRecordsQuery: vi.fn(),
  useLedgerTemplatesQuery: vi.fn(),
  usePostBudgetClearMutation: vi.fn(),
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

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useGetRecordBillQuery: hooks.useGetRecordBillQuery,
  useLedgerRecordBillQuery: hooks.useLedgerRecordBillQuery,
  useLedgerRecordsQuery: hooks.useLedgerRecordsQuery,
}));

vi.mock('@/entities/chart', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/chart')>()),
  useGetChartQuery: hooks.useGetChartQuery,
  useLedgerChartQuery: hooks.useLedgerChartQuery,
}));

vi.mock('@/entities/budget', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/budget')>()),
  useCreateLedgerBudgetSummaryMutation: hooks.useCreateLedgerBudgetSummaryMutation,
  useDeleteBudgetCategoryByBudgetIdMutation: hooks.useDeleteBudgetCategoryByBudgetIdMutation,
  useGetBudgetInfoQuery: hooks.useGetBudgetInfoQuery,
  useLedgerBudgetInfoQuery: hooks.useLedgerBudgetInfoQuery,
  usePostBudgetClearMutation: hooks.usePostBudgetClearMutation,
}));

vi.mock('@/pages/record/detail/List', () => ({ default: () => createElement('div', { 'data-testid': 'personal-record-list' }) }));
vi.mock('@/pages/record/model/useVisibleAmount', () => ({
  useVisibleAmount: () => ({
    isVisibleAmount: true,
    onToggleVisibleAmount: vi.fn(),
    visibleAmount: true,
    visibleAmountSwitch: false,
  }),
}));
vi.mock('@/features/ledger-record-form', () => ({
  LedgerRecordForm: ({ onSaved }: { onSaved: () => void }) => createElement('button', { 'data-testid': 'mock-record-save', 'onClick': onSaved, 'type': 'button' }, 'save'),
}));

vi.mock('@/shared/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
  useTranslation: () => ({
    t: (key: string, values?: { count?: number }) => ({
      'amount.expend': '支出',
      'calendar.title': '日历',
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
  act(() => root.render(createElement(RouterProvider, { router })));
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
  hooks.useLedgerPreferencesQuery.mockReturnValue({ data: undefined, isError: false, isLoading: false });
  hooks.useLedgerRecordsQuery.mockReturnValue({ data: { data: [], expend: 2, income: 5, total: 0 }, isError: false, isLoading: false });
  hooks.useGetRecordBillQuery.mockReturnValue({ data: billData, isError: false, isLoading: false });
  hooks.useLedgerRecordBillQuery.mockReturnValue({ data: billData, isError: false, isLoading: false });
  hooks.useGetChartQuery.mockReturnValue({ data: [], isError: false, isLoading: false });
  hooks.useLedgerChartQuery.mockReturnValue({ data: [], isError: false, isLoading: false });
  hooks.useGetBudgetInfoQuery.mockReturnValue({ data: { categoryBudgets: [] }, isError: false, isLoading: false });
  hooks.useLedgerBudgetInfoQuery.mockReturnValue({ data: { categoryBudgets: [] }, isError: false, isLoading: false });
  hooks.useCreateLedgerBudgetSummaryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useDeleteBudgetCategoryByBudgetIdMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.usePostBudgetClearMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useLedgerTemplatesQuery.mockReturnValue({ data: templates, isError: false, isLoading: false, refetch: vi.fn() });
  hooks.useCreateLedgerMutation.mockReturnValue([hooks.createLedger, { isLoading: false }]);
});

afterEach(cleanupRender);

describe('personal ledger workspace integration', () => {
  it('preserves the original app header and direct search/calendar actions', async () => {
    const { container, router } = renderPage('/detail', '/detail', createElement(DetailPage));
    const title = container.querySelector('[data-testid="ledger-switcher-title"]');

    expect(title?.textContent).toContain('鲸浪账本');
    expect(title?.tagName).toBe('BUTTON');
    expect(container.querySelector('[data-testid="mini-program-capsule"]')).toBeNull();
    expect(container.querySelector('[data-testid="record-search-action"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="record-calendar-action"]')).not.toBeNull();

    await click(container.querySelector('[data-testid="record-search-action"]'));
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
    const periodTabs = container.querySelectorAll('.bill-period-tabs > div');

    expect(container.querySelector('[data-testid="bill-year-selector"]')?.textContent).toContain('2026年');
    expect(container.textContent).toContain('月账单');
    expect(container.querySelector('.bwm-button-full')).not.toBeNull();
    expect(periodTabs).toHaveLength(2);

    await click(periodTabs[1]);
    await vi.waitFor(() => expect(
      container.querySelector<HTMLElement>('[data-testid="bill-year-selector"]')?.style.opacity,
    ).toBe('0'));
    await click(container.querySelector('.bwm-button-full'));
    expect(router.state.location.pathname).toBe('/origin');
  });

  it('changes personal chart amount and range filters through the restored controls', async () => {
    const { container, router } = renderPage('/chart', '/chart', createElement(ChartHomePage));
    const ranges = container.querySelectorAll('.chart-period-tabs > div');

    expect(ranges).toHaveLength(3);
    await click(ranges[2]);
    expect(router.state.location.search).toContain('range=year');

    await click(container.querySelector('.adm-dropdown-item-title'));
    await click(document.querySelector('[data-chart-amount-type="add"]'));
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
  it('uses the current ledger name, obeys quick-switch preference, and preserves ledger-scoped tabs', () => {
    const first = renderPage('/ledgers/ledger%2Fa/records', '/ledgers/:ledgerId/records', createElement(LedgerRecordsPage));

    expect(first.container.querySelector('[data-testid="ledger-switcher-title"]')?.textContent).toContain('家庭旅行账本');
    expect(first.container.querySelector('[data-testid="ledger-switcher-title"]')?.tagName).toBe('BUTTON');
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
    expect(second.container.querySelector('[data-testid="ledger-switcher-title"]')?.tagName).toBe('SPAN');
    expect(second.container.querySelector('[data-testid="ledger-switcher-title"]')?.getAttribute('aria-disabled')).toBe('true');
  });

  it('replaces custom records with personal detail through its title switcher', async () => {
    const { container, router } = renderPage('/ledgers/ledger%2Fa/records', '/ledgers/:ledgerId/records', createElement(LedgerRecordsPage));

    await click(container.querySelector('[data-testid="ledger-switcher-title"]'));
    await click(document.querySelector('[data-testid="ledger-switch-item-personal"]'));
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
    expect(container.querySelector('.adm-nav-bar-back') !== null).toBe(!hasWorkspaceTabBar);
  });

  it('returns a directly opened custom budget to its ledger detail', async () => {
    const { container, router } = renderPage(
      '/ledgers/ledger%2Fa/budget',
      '/ledgers/:ledgerId/budget',
      createElement(LedgerBudgetPage),
    );

    await click(container.querySelector('.adm-nav-bar-back'));
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa');
  });

  it('registers a scoped bill page, gates its query, and returns to its ledger detail', async () => {
    const { default: LedgerBillPage } = await import('@/pages/bill/LedgerBillPage');
    const first = renderPage('/ledgers/ledger%2Fa/bill', '/ledgers/:ledgerId/bill', createElement(LedgerBillPage));

    expect(hooks.useLedgerRecordBillQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ ledgerId: 'ledger/a' }),
    }));
    expect(first.container.querySelector('[data-testid="mini-program-capsule"]')).toBeNull();
    expect(first.container.querySelector('[data-testid="ledger-switcher-title"]')).toBeNull();
    expect(first.container.querySelector('.bwm-button-full')).not.toBeNull();
    await click(first.container.querySelector('.bwm-button-full'));
    expect(first.router.state.location.pathname).toBe('/ledgers/ledger%2Fa');

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

    await click(container.querySelector('.adm-nav-bar-back'));
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/records');
    expect(router.state.historyAction).toBe('REPLACE');
  });
});
