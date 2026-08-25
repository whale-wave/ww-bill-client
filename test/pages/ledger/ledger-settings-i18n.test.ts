import type { ReactNode } from 'react';
import type { Ledger, LedgerPreference } from '@/entities/ledger';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
import LedgerPreferencesPage from '@/pages/ledger-preferences/LedgerPreferencesPage';
import LedgerSettingsPage from '@/pages/ledger-settings/LedgerSettingsPage';
import { changeLanguage } from '@/shared/i18n';

const hooks = vi.hoisted(() => ({
  useArchiveLedgerMutation: vi.fn(),
  useGetUserAppConfigQuery: vi.fn(),
  useGetUserUserInfoQuery: vi.fn(),
  useLeaveLedgerMutation: vi.fn(),
  useLedgerMembersQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  usePatchLedgerMutation: vi.fn(),
  usePatchLedgerPreferencesMutation: vi.fn(),
  usePatchLedgerQuickSwitchMutation: vi.fn(),
}));

vi.mock('@/entities/ledger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/ledger')>();
  return {
    ...actual,
    useArchiveLedgerMutation: hooks.useArchiveLedgerMutation,
    useLeaveLedgerMutation: hooks.useLeaveLedgerMutation,
    useLedgerMembersQuery: hooks.useLedgerMembersQuery,
    useLedgerPreferencesQuery: hooks.useLedgerPreferencesQuery,
    useLedgerQuery: hooks.useLedgerQuery,
    usePatchLedgerMutation: hooks.usePatchLedgerMutation,
    usePatchLedgerPreferencesMutation: hooks.usePatchLedgerPreferencesMutation,
  };
});

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: hooks.useGetUserUserInfoQuery,
}));

vi.mock('@/entities/user-app-config', () => ({
  useGetUserAppConfigQuery: hooks.useGetUserAppConfigQuery,
  usePatchLedgerQuickSwitchMutation: hooks.usePatchLedgerQuickSwitchMutation,
}));

const mockLedger: Ledger = {
  capabilities: Object.values(LedgerCapability),
  createdAt: '2026-07-21T00:00:00.000Z',
  createdByUserId: 1,
  iconKey: 'wallet',
  id: 'ledger/test',
  kind: LedgerKind.CUSTOM,
  monthStartDay: 1,
  myRole: LedgerRole.OWNER,
  name: '测试账本',
  ownerUserId: 1,
  status: LedgerStatus.ACTIVE,
  templateKey: 'business',
  templateVersion: 1,
  themeKey: 'green',
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 1,
};

const mockPreference: LedgerPreference = {
  defaultChartDisplay: LedgerChartDisplay.PIE,
  defaultChartMetric: LedgerChartMetric.EXPENSE,
  defaultChartPeriod: LedgerChartPeriod.MONTH,
  defaultRecordType: LedgerRecordType.EXPENSE,
  hideTotalAmount: false,
  id: 'pref/1',
  showDailySummary: true,
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 1,
};

let cleanup: (() => void) | undefined;

function renderPage(pathname: string, routePath: string, element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([
    { element, path: routePath },
    { element: createElement('div', null, 'home'), path: '/detail' },
  ], { initialEntries: [pathname] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  hooks.useLedgerQuery.mockReturnValue({ data: mockLedger, isError: false, isLoading: false });
  hooks.useLedgerPreferencesQuery.mockReturnValue({ data: mockPreference, isError: false, isLoading: false });
  hooks.useLedgerMembersQuery.mockReturnValue({ data: [], isError: false, isLoading: false });
  hooks.useGetUserUserInfoQuery.mockReturnValue({ data: { id: 1, name: 'Owner' }, isLoading: false });
  hooks.usePatchLedgerMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.usePatchLedgerPreferencesMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useArchiveLedgerMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useLeaveLedgerMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useGetUserAppConfigQuery.mockReturnValue({
    data: { isLedgerQuickSwitchEnabled: true, ledgerQuickSwitchVersion: 1 },
    isLoading: false,
    refetch: vi.fn(),
  });
  hooks.usePatchLedgerQuickSwitchMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

afterAll(async () => {
  await changeLanguage('zh-CN');
});

describe('ledger settings page i18n & raw key protection', () => {
  it('renders localized Chinese copy in LedgerSettingsPage and LedgerPreferencesPage without any raw keys', async () => {
    await changeLanguage('zh-CN');

    const { container: settingsContainer } = renderPage(
      '/ledgers/ledger%2Ftest/settings',
      '/ledgers/:ledgerId/settings',
      createElement(LedgerSettingsPage),
    );

    const settingsText = settingsContainer.textContent ?? '';
    expect(settingsText).toContain('账本设置');
    expect(settingsText).toContain('我的偏好');
    expect(settingsText).not.toMatch(/\bsettings\.sub\b/);
    expect(settingsText).not.toMatch(/\bledger\.[\w.-]+\b/);
    expect(settingsText).not.toMatch(/\basset\.[\w.-]+\b/);

    cleanup?.();
    cleanup = undefined;

    const { container: prefContainer } = renderPage(
      '/ledgers/preferences',
      '/ledgers/preferences',
      createElement(LedgerPreferencesPage),
    );

    const prefText = prefContainer.textContent ?? '';
    expect(prefText).toContain('分账本快捷入口');
    expect(prefText).not.toMatch(/\bsettings\.sub\b/);
    expect(prefText).not.toMatch(/\bledger\.[\w.-]+\b/);
  });

  it('renders localized English copy in LedgerSettingsPage and LedgerPreferencesPage without any raw keys', async () => {
    await changeLanguage('en');

    const { container: settingsContainer } = renderPage(
      '/ledgers/ledger%2Ftest/settings',
      '/ledgers/:ledgerId/settings',
      createElement(LedgerSettingsPage),
    );

    const settingsText = settingsContainer.textContent ?? '';
    expect(settingsText).toContain('Ledger Settings');
    expect(settingsText).toContain('My Preferences');
    expect(settingsText).not.toMatch(/\bsettings\.sub\b/);
    expect(settingsText).not.toMatch(/\bledger\.[\w.-]+\b/);
    expect(settingsText).not.toMatch(/\basset\.[\w.-]+\b/);

    cleanup?.();
    cleanup = undefined;

    const { container: prefContainer } = renderPage(
      '/ledgers/preferences',
      '/ledgers/preferences',
      createElement(LedgerPreferencesPage),
    );

    const prefText = prefContainer.textContent ?? '';
    expect(prefText).toContain('Quick Switch');
    expect(prefText).not.toMatch(/\bsettings\.sub\b/);
    expect(prefText).not.toMatch(/\bledger\.[\w.-]+\b/);
  });
});
