import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LedgerCapability,
  LedgerChartDisplay,
  LedgerChartMetric,
  LedgerChartPeriod,
  LedgerKind,
  LedgerRecordType,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import LedgerCalendarPage from '@/pages/ledger-calendar/LedgerCalendarPage';
import LedgerChartsPage from '@/pages/ledger-charts/LedgerChartsPage';
import LedgerRecordsPage from '@/pages/ledger-records/LedgerRecordsPage';

const hooks = vi.hoisted(() => ({
  patchLedgerPreferencesApi: vi.fn(),
  useGetUserAppConfigQuery: vi.fn(),
  useLedgerChartQuery: vi.fn(),
  useLedgerNavigationQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerRecordsQuery: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  patchLedgerPreferencesApi: hooks.patchLedgerPreferencesApi,
  useLedgerNavigationQuery: hooks.useLedgerNavigationQuery,
  useLedgerPreferencesQuery: hooks.useLedgerPreferencesQuery,
  useLedgerQuery: hooks.useLedgerQuery,
}));

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: hooks.useGetUserAppConfigQuery,
}));

vi.mock('@/entities/chart', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/chart')>()),
  useLedgerChartQuery: hooks.useLedgerChartQuery,
  useLedgerTagRankingQuery: () => ({ data: undefined, isError: false, isLoading: false }),
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useLedgerRecordsQuery: hooks.useLedgerRecordsQuery,
}));

vi.mock('@/shared/i18n', () => ({
  i18n: {
    t: (key: string, values?: Record<string, unknown>) => values
      ? `${key}:${JSON.stringify(values)}`
      : key,
  },
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => values
      ? `${key}:${JSON.stringify(values)}`
      : key,
  }),
}));

vi.mock('@/shared/lib/use-chart', () => ({
  useChart: () => ({
    chartDomRef: { current: null },
    myChart: { setOption: vi.fn() },
  }),
}));

const ledger = {
  capabilities: [
    LedgerCapability.RECORD_READ,
    LedgerCapability.CHART_READ,
  ],
  createdAt: '2026-07-21T00:00:00.000Z',
  createdByUserId: 1,
  iconKey: 'wallet',
  id: 'ledger/a',
  kind: LedgerKind.CUSTOM,
  monthStartDay: 1,
  myRole: LedgerRole.VIEWER,
  name: '共享账本',
  ownerUserId: 1,
  status: LedgerStatus.ACTIVE,
  themeKey: 'blue',
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 1,
};

const preference = {
  defaultChartDisplay: LedgerChartDisplay.PIE,
  defaultChartMetric: LedgerChartMetric.EXPENSE,
  defaultChartPeriod: LedgerChartPeriod.MONTH,
  defaultRecordType: LedgerRecordType.EXPENSE,
  hideTotalAmount: false,
  id: 'preference/a',
  showDailySummary: false,
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 1,
};

let cleanup: (() => void) | undefined;

function renderPage(
  element: ReactNode,
  initialEntry = '/ledgers/ledger%2Fa/page',
) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([{
    path: '/ledgers/:ledgerId/page',
    element,
  }], { initialEntries: [initialEntry] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return container;
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useLedgerQuery.mockReturnValue({ data: ledger, isError: false, isLoading: false, refetch: vi.fn() });
  hooks.useLedgerNavigationQuery.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.useGetUserAppConfigQuery.mockReturnValue({
    data: { isLedgerQuickSwitchEnabled: false, ledgerQuickSwitchVersion: 1 },
    isError: false,
    isLoading: false,
  });
  hooks.useLedgerPreferencesQuery.mockReturnValue({ data: preference, isError: false, isLoading: false });
  hooks.patchLedgerPreferencesApi.mockResolvedValue({});
  hooks.useLedgerRecordsQuery.mockReturnValue({
    data: { data: [], expend: 5, income: 10, total: 0 },
    isError: false,
    isLoading: false,
  });
  hooks.useLedgerChartQuery.mockReturnValue({ data: [], isLoading: false });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger preference consumers', () => {
  it('masks the record summary when total amounts are hidden', () => {
    hooks.useLedgerPreferencesQuery.mockReturnValue({
      data: { ...preference, hideTotalAmount: true },
      isError: false,
      isLoading: false,
    });

    const container = renderPage(createElement(LedgerRecordsPage));

    expect(container.querySelector('[data-testid="ledger-monthly-income"]')?.textContent).toContain('＊＊＊＊＊');
    expect(container.querySelector('[data-testid="ledger-monthly-expense"]')?.textContent).toContain('＊＊＊＊＊');
    expect(container.querySelector('[data-record-overview-metrics]')?.textContent).not.toContain('10');
  });

  it('uses the compact shared-ledger icon treatment in the title row', () => {
    const container = renderPage(createElement(LedgerRecordsPage));

    const iconContainer = container.querySelector('[data-record-overview-title-row] > span');
    const icon = iconContainer?.querySelector('svg');
    expect(iconContainer?.classList).toContain('bg-white/75');
    expect(iconContainer?.classList).toContain('!bg-none');
    expect(icon?.classList).toContain('text-primary-deep');
  });

  it('persists amount visibility changes on the current shared ledger', async () => {
    const refetchPreference = vi.fn().mockResolvedValue(undefined);
    hooks.useLedgerPreferencesQuery.mockReturnValue({
      data: { ...preference, version: 4 },
      isError: false,
      isLoading: false,
      refetch: refetchPreference,
    });
    const container = renderPage(createElement(LedgerRecordsPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="toggle amount visibility"]')?.click());

    expect(hooks.patchLedgerPreferencesApi).toHaveBeenCalledWith('ledger/a', {
      hideTotalAmount: true,
      version: 4,
    });
    expect(refetchPreference).toHaveBeenCalled();
  });

  it('shows the selected day summary only when enabled', () => {
    const today = dayjs().format('YYYY-MM-DD');
    hooks.useLedgerPreferencesQuery.mockReturnValue({
      data: { ...preference, showDailySummary: true },
      isError: false,
      isLoading: false,
    });
    hooks.useLedgerRecordsQuery.mockReturnValue({
      data: {
        data: [{
          amount: '10.00',
          category: { icon: 'salary', id: 1, name: 'Salary' },
          createdAt: `${today}T08:00:00.000Z`,
          id: 1,
          remark: 'Income',
          time: `${today}T08:00:00.000Z`,
          type: 'add',
          updatedAt: `${today}T08:00:00.000Z`,
          version: 1,
        }, {
          amount: '5.00',
          category: { icon: 'catering', id: 2, name: 'Dining' },
          createdAt: `${today}T09:00:00.000Z`,
          id: 2,
          remark: 'Expense',
          time: `${today}T09:00:00.000Z`,
          type: 'sub',
          updatedAt: `${today}T09:00:00.000Z`,
          version: 1,
        }],
        expend: 5,
        income: 10,
        total: 2,
      },
      isError: false,
      isLoading: false,
    });

    const container = renderPage(createElement(LedgerCalendarPage));

    expect(container.querySelector(`[data-date="${today}"]`)?.textContent).toContain('+10.00');
    expect(container.querySelector(`[data-date="${today}"]`)?.textContent).toContain('-5.00');
  });

  it('uses chart period, metric, and display preferences as initial controls', () => {
    hooks.useLedgerPreferencesQuery.mockReturnValue({
      data: {
        ...preference,
        defaultChartDisplay: LedgerChartDisplay.LINE,
        defaultChartMetric: LedgerChartMetric.INCOME,
        defaultChartPeriod: LedgerChartPeriod.YEAR,
      },
      isError: false,
      isLoading: false,
    });

    const container = renderPage(createElement(LedgerChartsPage));

    expect(hooks.useLedgerChartQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: {
        filters: { category: LedgerChartPeriod.YEAR, type: 'add' },
        ledgerId: 'ledger/a',
      },
      queryOptions: { enabled: true },
    }));
    expect(container.querySelector('[data-chart-display="line"]')?.classList)
      .toContain('ww-tab-bar-scroll-padding');
  });

  it('lets URL state override preferences and falls net plus pie back to the line slot', () => {
    hooks.useLedgerChartQuery.mockReturnValue({
      data: [{
        amount: 10,
        average: '10',
        data: [{ amount: 10, data: [], type: 'month', value: '2026-07-01' }],
        ranking: [],
        type: 'year',
        value: 2026,
      }],
      isError: false,
      isLoading: false,
    });

    const container = renderPage(
      createElement(LedgerChartsPage),
      '/ledgers/ledger%2Fa/page?metric=net&range=year&display=pie',
    );

    expect(hooks.useLedgerChartQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: {
        filters: { category: LedgerChartPeriod.YEAR, type: 'add' },
        ledgerId: 'ledger/a',
      },
      queryOptions: { enabled: true },
    }));
    expect(hooks.useLedgerChartQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: {
        filters: { category: LedgerChartPeriod.YEAR, type: 'sub' },
        ledgerId: 'ledger/a',
      },
      queryOptions: { enabled: true },
    }));
    expect(container.querySelector('[data-chart-display="line"]')).not.toBeNull();
    expect(container.textContent).toContain('charts.netNoRanking');
  });

  it('does not show a loader for an inactive chart query', () => {
    hooks.useLedgerPreferencesQuery.mockReturnValue({
      data: { ...preference, defaultChartDisplay: LedgerChartDisplay.LINE },
      isError: false,
      isLoading: false,
    });
    hooks.useLedgerChartQuery
      .mockReturnValueOnce({ data: [], isLoading: true })
      .mockReturnValueOnce({
        data: [{
          amount: 1,
          average: '1',
          data: [{ amount: 1, data: [], type: 'month', value: '2026-07-01' }],
          ranking: [],
          type: 'year',
          value: 2026,
        }],
        isError: false,
        isLoading: false,
      });

    const container = renderPage(createElement(LedgerChartsPage));

    expect(container.querySelector('.adm-spin-loading')).toBeNull();
    expect(container.querySelector('[data-testid="ledger-chart-total"]')?.textContent).toBe('1');
  });
});
