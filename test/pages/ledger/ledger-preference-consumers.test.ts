import type { ReactNode } from 'react';
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
  useGetUserAppConfigQuery: vi.fn(),
  useLedgerChartQuery: vi.fn(),
  useLedgerNavigationQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerRecordsQuery: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
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
}));

vi.mock('@/entities/record', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/record')>()),
  useLedgerRecordsQuery: hooks.useLedgerRecordsQuery,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => values
      ? `${key}:${JSON.stringify(values)}`
      : key,
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

function renderPage(element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([{
    path: '/ledgers/:ledgerId/page',
    element,
  }], { initialEntries: ['/ledgers/ledger%2Fa/page'] });
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

    expect(container.querySelector('[data-testid="ledger-record-summary"]')?.textContent).toContain('••••');
    expect(container.querySelector('[data-testid="ledger-record-summary"]')?.textContent).not.toContain('10');
  });

  it('shows the selected day summary only when enabled', () => {
    hooks.useLedgerPreferencesQuery.mockReturnValue({
      data: { ...preference, showDailySummary: true },
      isError: false,
      isLoading: false,
    });

    const container = renderPage(createElement(LedgerCalendarPage));

    expect(container.querySelector('[data-testid="ledger-daily-summary"]')?.textContent).toContain('10');
    expect(container.querySelector('[data-testid="ledger-daily-summary"]')?.textContent).toContain('5');
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
    expect(container.querySelector('[data-chart-display="line"]')).not.toBeNull();
  });

  it('does not show a loader for an inactive chart query', () => {
    hooks.useLedgerChartQuery
      .mockReturnValueOnce({ data: [], isLoading: true })
      .mockReturnValueOnce({ data: [{ amount: 1, value: 2026 }], isLoading: false });

    const container = renderPage(createElement(LedgerChartsPage));

    expect(container.querySelector('.adm-spin-loading')).toBeNull();
    expect(container.querySelector('[data-testid="ledger-chart-total"]')?.textContent).toBe('1');
  });
});
