import type { ReactNode } from 'react';
import type { Ledger, LedgerPreference } from '@/entities/ledger';
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
import LedgerCategoriesPage from '@/pages/ledger-categories/LedgerCategoriesPage';
import LedgerSettingsPage from '@/pages/ledger-settings/LedgerSettingsPage';
import LedgerTagsPage from '@/pages/ledger-tags/LedgerTagsPage';

const hooks = vi.hoisted(() => ({
  archiveLedger: vi.fn(),
  archiveTag: vi.fn(),
  deleteCategory: vi.fn(),
  leaveLedger: vi.fn(),
  patchLedger: vi.fn(),
  patchPreferences: vi.fn(),
  refetchLedger: vi.fn(),
  refetchPreferences: vi.fn(),
  updateCategory: vi.fn(),
  updateTag: vi.fn(),
  useArchiveLedgerMutation: vi.fn(),
  useArchiveLedgerTagMutation: vi.fn(),
  useCreateLedgerCategoryMutation: vi.fn(),
  useCreateLedgerTagMutation: vi.fn(),
  useDeleteLedgerCategoryMutation: vi.fn(),
  useLedgerCategoriesQuery: vi.fn(),
  useLedgerMembersQuery: vi.fn(),
  useLedgerPreferencesQuery: vi.fn(),
  useLedgerQuery: vi.fn(),
  useLedgerTagsQuery: vi.fn(),
  useLeaveLedgerMutation: vi.fn(),
  usePatchLedgerMutation: vi.fn(),
  usePatchLedgerPreferencesMutation: vi.fn(),
  useUpdateLedgerCategoryMutation: vi.fn(),
  useUpdateLedgerTagMutation: vi.fn(),
}));

vi.mock('@/entities/ledger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger')>()),
  useArchiveLedgerMutation: hooks.useArchiveLedgerMutation,
  useLeaveLedgerMutation: hooks.useLeaveLedgerMutation,
  useLedgerMembersQuery: hooks.useLedgerMembersQuery,
  useLedgerPreferencesQuery: hooks.useLedgerPreferencesQuery,
  useLedgerQuery: hooks.useLedgerQuery,
  usePatchLedgerMutation: hooks.usePatchLedgerMutation,
  usePatchLedgerPreferencesMutation: hooks.usePatchLedgerPreferencesMutation,
}));

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: () => ({ data: { id: 1 }, isLoading: false }),
}));

const dialogConfirm = vi.hoisted(() => vi.fn());

vi.mock('antd-mobile', async importOriginal => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Dialog: { confirm: dialogConfirm },
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useCreateLedgerCategoryMutation: hooks.useCreateLedgerCategoryMutation,
  useDeleteLedgerCategoryMutation: hooks.useDeleteLedgerCategoryMutation,
  useLedgerCategoriesQuery: hooks.useLedgerCategoriesQuery,
  useUpdateLedgerCategoryMutation: hooks.useUpdateLedgerCategoryMutation,
}));

vi.mock('@/entities/ledger-data', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger-data')>()),
  useArchiveLedgerTagMutation: hooks.useArchiveLedgerTagMutation,
  useCreateLedgerTagMutation: hooks.useCreateLedgerTagMutation,
  useLedgerTagsQuery: hooks.useLedgerTagsQuery,
  useUpdateLedgerTagMutation: hooks.useUpdateLedgerTagMutation,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const capabilities = Object.values(LedgerCapability);
const ledger: Ledger = {
  capabilities,
  createdAt: '2026-07-21T00:00:00.000Z',
  createdByUserId: 1,
  iconKey: 'shop',
  id: 'ledger/a',
  kind: LedgerKind.CUSTOM,
  monthStartDay: 1,
  myRole: LedgerRole.OWNER,
  name: '生意账本',
  ownerUserId: 1,
  status: LedgerStatus.ACTIVE,
  templateKey: 'business',
  templateVersion: 1,
  themeKey: 'green',
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 3,
};

const preference: LedgerPreference = {
  defaultChartDisplay: LedgerChartDisplay.PIE,
  defaultChartMetric: LedgerChartMetric.EXPENSE,
  defaultChartPeriod: LedgerChartPeriod.MONTH,
  defaultRecordType: LedgerRecordType.EXPENSE,
  hideTotalAmount: false,
  id: 'preference/a',
  showDailySummary: false,
  updatedAt: '2026-07-21T00:00:00.000Z',
  version: 2,
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
    { path: '/ledgers/:ledgerId/settings/categories', element: createElement('div', null, 'categories-target') },
    { path: '/ledgers/:ledgerId/settings/tags', element: createElement('div', null, 'tags-target') },
    { path: '/ledgers/:ledgerId/members', element: createElement('div', null, 'members-target') },
    { path: '/ledgers', element: createElement('div', null, 'ledgers-target') },
  ].filter((route, index, routes) => routes.findIndex(candidate => candidate.path === route.path) === index), { initialEntries: [pathname] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useLedgerQuery.mockReturnValue({ ...query(ledger), refetch: hooks.refetchLedger });
  hooks.useLedgerPreferencesQuery.mockReturnValue({ ...query(preference), refetch: hooks.refetchPreferences });
  hooks.usePatchLedgerMutation.mockReturnValue([hooks.patchLedger, { isLoading: false }]);
  hooks.usePatchLedgerPreferencesMutation.mockReturnValue([hooks.patchPreferences, { isLoading: false }]);
  hooks.useArchiveLedgerMutation.mockReturnValue([hooks.archiveLedger, { isLoading: false }]);
  hooks.useLeaveLedgerMutation.mockReturnValue([hooks.leaveLedger, { isLoading: false }]);
  hooks.useLedgerMembersQuery.mockReturnValue(query([{
    capabilities: [],
    id: 'member/me',
    joinedAt: '2026-07-21T00:00:00.000Z',
    nickname: '',
    role: LedgerRole.BOOKKEEPER,
    status: 'ACTIVE',
    user: { id: 1, name: '我' },
    version: 5,
  }]));
  hooks.useLedgerCategoriesQuery.mockReturnValue(query([{ createdAt: '', icon: 'meal', id: 1, name: '餐饮', type: 'sub', updatedAt: '' }]));
  hooks.useUpdateLedgerCategoryMutation.mockReturnValue([hooks.updateCategory, { isLoading: false }]);
  hooks.useCreateLedgerCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useDeleteLedgerCategoryMutation.mockReturnValue([hooks.deleteCategory, { isLoading: false }]);
  hooks.useLedgerTagsQuery.mockReturnValue(query([{ createdAt: '', createdByUserId: 1, id: 'tag/a', ledgerId: ledger.id, name: '聚餐', status: 'ACTIVE', updatedAt: '', version: 4 }]));
  hooks.useUpdateLedgerTagMutation.mockReturnValue([hooks.updateTag, { isLoading: false }]);
  hooks.useCreateLedgerTagMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useArchiveLedgerTagMutation.mockReturnValue([hooks.archiveTag, { isLoading: false }]);
  dialogConfirm.mockReset();
  dialogConfirm.mockResolvedValue(true);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('ledger settings', () => {
  it('saves canonical basic fields and the current member preferences with versions', async () => {
    hooks.patchLedger.mockResolvedValue({ data: ledger });
    hooks.patchPreferences.mockResolvedValue({ data: preference });
    const { container } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    await act(async () => {
      const icon = container.querySelector<HTMLSelectElement>('[data-testid="ledger-icon"]');
      const theme = container.querySelector<HTMLSelectElement>('[data-testid="ledger-theme"]');
      const recordType = container.querySelector<HTMLSelectElement>('[data-testid="ledger-default-record-type"]');
      const chartPeriod = container.querySelector<HTMLSelectElement>('[data-testid="ledger-default-chart-period"]');
      const chartMetric = container.querySelector<HTMLSelectElement>('[data-testid="ledger-default-chart-metric"]');
      const chartDisplay = container.querySelector<HTMLSelectElement>('[data-testid="ledger-default-chart-display"]');
      if (icon) {
        icon.value = 'wallet';
        icon.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (theme) {
        theme.value = 'amber';
        theme.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (recordType) {
        recordType.value = LedgerRecordType.INCOME;
        recordType.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (chartPeriod) {
        chartPeriod.value = LedgerChartPeriod.YEAR;
        chartPeriod.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (chartMetric) {
        chartMetric.value = LedgerChartMetric.NET;
        chartMetric.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (chartDisplay) {
        chartDisplay.value = LedgerChartDisplay.LINE;
        chartDisplay.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-basic-save"]')?.click());
    await act(async () => container.querySelector<HTMLInputElement>('[data-testid="ledger-hide-total"]')?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-preferences-save"]')?.click());

    expect(hooks.patchLedger).toHaveBeenCalledWith({
      data: { iconKey: 'wallet', monthStartDay: 1, name: '生意账本', themeKey: 'amber', version: 3 },
      ledgerId: 'ledger/a',
    });
    expect(hooks.patchPreferences).toHaveBeenCalledWith({
      data: expect.objectContaining({
        defaultChartDisplay: LedgerChartDisplay.LINE,
        defaultChartMetric: LedgerChartMetric.NET,
        defaultChartPeriod: LedgerChartPeriod.YEAR,
        defaultRecordType: LedgerRecordType.INCOME,
        hideTotalAmount: true,
        version: 2,
      }),
      ledgerId: 'ledger/a',
    });
  });

  it('drives management entries from capabilities and never archives SYSTEM_DEFAULT', async () => {
    const { container, router } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));
    expect(container.querySelector('[data-testid="ledger-archive"]')).not.toBeNull();
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-settings-categories"]')?.click());
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/settings/categories');

    cleanup?.();
    hooks.useLedgerQuery.mockReturnValue(query({ ...ledger, kind: LedgerKind.SYSTEM_DEFAULT }));
    const rendered = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));
    expect(rendered.container.querySelector('[data-testid="ledger-archive"]')).toBeNull();
  });

  it('hides category and tag management entries from read-only members', () => {
    hooks.useLedgerQuery.mockReturnValue(query({
      ...ledger,
      capabilities: [LedgerCapability.CATEGORY_READ, LedgerCapability.TAG_READ],
      myRole: LedgerRole.VIEWER,
    }));

    const { container } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    expect(container.querySelector('[data-testid="ledger-settings-categories"]')).toBeNull();
    expect(container.querySelector('[data-testid="ledger-settings-tags"]')).toBeNull();
  });

  it('disables member preference writes while the ledger is suspended', () => {
    hooks.useLedgerQuery.mockReturnValue(query({
      ...ledger,
      capabilities: [
        LedgerCapability.LEDGER_READ,
        LedgerCapability.MEMBER_READ,
        LedgerCapability.CATEGORY_READ,
        LedgerCapability.TAG_READ,
      ],
      status: LedgerStatus.SUSPENDED,
    }));

    const { container } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    expect(container.querySelector<HTMLInputElement>('[data-testid="ledger-hide-total"]')?.disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('[data-testid="ledger-preferences-save"]')?.disabled).toBe(true);
    expect(container.querySelector('[data-testid="ledger-settings-categories"]')).toBeNull();
    expect(container.querySelector('[data-testid="ledger-settings-tags"]')).toBeNull();
  });

  it('lets a non-owner leave with the current membership version', async () => {
    hooks.useLedgerQuery.mockReturnValue(query({
      ...ledger,
      capabilities: [LedgerCapability.LEDGER_READ, LedgerCapability.MEMBER_READ],
      myRole: LedgerRole.BOOKKEEPER,
    }));
    hooks.leaveLedger.mockResolvedValue({ data: {} });
    const { container, router } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-leave"]')?.click());

    expect(hooks.leaveLedger).toHaveBeenCalledWith({ ledgerId: 'ledger/a', version: 5 });
    expect(router.state.location.pathname).toBe('/ledgers');
    expect(router.state.historyAction).toBe('REPLACE');
  });
});

describe('ledger category and tag management', () => {
  it('renames one ledger category inside the URL-scoped ledger', async () => {
    hooks.updateCategory.mockResolvedValue({ statusCode: 200 });
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-category-save-1"]')?.click());
    expect(hooks.updateCategory).toHaveBeenCalledWith({ categoryId: 1, data: { name: '餐饮' }, ledgerId: 'ledger/a' });
  });

  it('updates and archives a tag with its optimistic version', async () => {
    hooks.updateTag.mockResolvedValue({ statusCode: 200 });
    hooks.archiveTag.mockResolvedValue({ statusCode: 200 });
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/tags', '/ledgers/:ledgerId/settings/tags', createElement(LedgerTagsPage));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-tag-save-tag/a"]')?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="ledger-tag-archive-tag/a"]')?.click());
    expect(hooks.updateTag).toHaveBeenCalledWith({ data: { name: '聚餐', version: 4 }, ledgerId: 'ledger/a', tagId: 'tag/a' });
    expect(hooks.archiveTag).toHaveBeenCalledWith({ ledgerId: 'ledger/a', tagId: 'tag/a', version: 4 });
  });
});
