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
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  leaveLedger: vi.fn(),
  patchLedger: vi.fn(),
  patchPreferences: vi.fn(),
  refetchLedger: vi.fn(),
  refetchPreferences: vi.fn(),
  updateCategory: vi.fn(),
  uploadCategory: vi.fn(),
  updateTag: vi.fn(),
  useArchiveLedgerMutation: vi.fn(),
  useArchiveLedgerTagMutation: vi.fn(),
  useCategoryIconCatalogQuery: vi.fn(),
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
  usePatchLedgerCategoryMutation: vi.fn(),
  useReorderLedgerCategoriesMutation: vi.fn(),
  useUploadLedgerCategoryIconMutation: vi.fn(),
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
const toastShow = vi.hoisted(() => vi.fn());

vi.mock('antd-mobile', async importOriginal => ({
  ...(await importOriginal<typeof import('antd-mobile')>()),
  Dialog: { confirm: dialogConfirm },
  Toast: { show: toastShow },
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useCreateLedgerCategoryMutation: hooks.useCreateLedgerCategoryMutation,
  useCategoryIconCatalogQuery: hooks.useCategoryIconCatalogQuery,
  useDeleteLedgerCategoryMutation: hooks.useDeleteLedgerCategoryMutation,
  useLedgerCategoriesQuery: hooks.useLedgerCategoriesQuery,
  usePatchLedgerCategoryMutation: hooks.usePatchLedgerCategoryMutation,
  useReorderLedgerCategoriesMutation: hooks.useReorderLedgerCategoriesMutation,
  useUpdateLedgerCategoryMutation: hooks.useUpdateLedgerCategoryMutation,
  useUploadLedgerCategoryIconMutation: hooks.useUploadLedgerCategoryIconMutation,
}));

vi.mock('@/entities/ledger-data', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/ledger-data')>()),
  useArchiveLedgerTagMutation: hooks.useArchiveLedgerTagMutation,
  useCreateLedgerTagMutation: hooks.useCreateLedgerTagMutation,
  useLedgerTagsQuery: hooks.useLedgerTagsQuery,
  useUpdateLedgerTagMutation: hooks.useUpdateLedgerTagMutation,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: 'zh-CN' },
    t: (key: string) => key,
  }),
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
    { path: '/detail', element: createElement('div', null, 'personal-detail-target') },
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
  hooks.useLedgerCategoriesQuery.mockReturnValue(query([{
    createdAt: '',
    icon: 'meal',
    iconType: 'BUILTIN',
    id: 1,
    isCustom: true,
    ledgerId: ledger.id,
    name: '餐饮',
    sortOrder: 0,
    status: 'ACTIVE',
    type: 'sub',
    updatedAt: '',
    version: 1,
  }]));
  hooks.useCategoryIconCatalogQuery.mockReturnValue(query([]));
  hooks.usePatchLedgerCategoryMutation.mockReturnValue([hooks.updateCategory, { isLoading: false }]);
  hooks.useReorderLedgerCategoriesMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useUploadLedgerCategoryIconMutation.mockReturnValue([hooks.uploadCategory, { isLoading: false }]);
  hooks.useUpdateLedgerCategoryMutation.mockReturnValue([hooks.updateCategory, { isLoading: false }]);
  hooks.useCreateLedgerCategoryMutation.mockReturnValue([hooks.createCategory, { isLoading: false }]);
  hooks.useDeleteLedgerCategoryMutation.mockReturnValue([hooks.deleteCategory, { isLoading: false }]);
  hooks.useLedgerTagsQuery.mockReturnValue(query([{ createdAt: '', createdByUserId: 1, id: 'tag/a', ledgerId: ledger.id, name: '聚餐', status: 'ACTIVE', updatedAt: '', version: 4 }]));
  hooks.useUpdateLedgerTagMutation.mockReturnValue([hooks.updateTag, { isLoading: false }]);
  hooks.useCreateLedgerTagMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  hooks.useArchiveLedgerTagMutation.mockReturnValue([hooks.archiveTag, { isLoading: false }]);
  dialogConfirm.mockReset();
  dialogConfirm.mockResolvedValue(true);
  toastShow.mockReset();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ledger settings', () => {
  it('saves canonical basic fields and the current member preferences with versions', async () => {
    hooks.patchLedger.mockResolvedValue({ data: ledger });
    hooks.patchPreferences.mockResolvedValue({ data: preference });
    const { container } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="basic"]')?.click());
    await act(async () => {
      const icon = document.body.querySelector<HTMLSelectElement>('[data-testid="ledger-icon"]');
      const theme = document.body.querySelector<HTMLSelectElement>('[data-testid="ledger-theme"]');
      if (icon) {
        icon.value = 'wallet';
        icon.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (theme) {
        theme.value = 'amber';
        theme.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await act(async () => document.body.querySelector<HTMLButtonElement>('[data-testid="ledger-basic-save"]')?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="preferences"]')?.click());
    await act(async () => {
      const recordType = document.body.querySelector<HTMLSelectElement>('[data-testid="ledger-default-record-type"]');
      const chartPeriod = document.body.querySelector<HTMLSelectElement>('[data-testid="ledger-default-chart-period"]');
      const chartMetric = document.body.querySelector<HTMLSelectElement>('[data-testid="ledger-default-chart-metric"]');
      const chartDisplay = document.body.querySelector<HTMLSelectElement>('[data-testid="ledger-default-chart-display"]');
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
    await act(async () => document.body.querySelector<HTMLInputElement>('[data-testid="ledger-hide-total"]')?.click());
    await act(async () => document.body.querySelector<HTMLButtonElement>('[data-testid="ledger-preferences-save"]')?.click());

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
    expect(container.querySelector('[data-settings-row="archive"]')).not.toBeNull();
    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="categories"]')?.click());
    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/settings/categories');

    cleanup?.();
    hooks.useLedgerQuery.mockReturnValue(query({ ...ledger, kind: LedgerKind.SYSTEM_DEFAULT }));
    const rendered = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));
    expect(rendered.container.querySelector('[data-settings-row="archive"]')).toBeNull();
  });

  it('shows read-only category settings while hiding tag management', () => {
    hooks.useLedgerQuery.mockReturnValue(query({
      ...ledger,
      capabilities: [
        LedgerCapability.LEDGER_READ,
        LedgerCapability.CATEGORY_READ,
        LedgerCapability.TAG_READ,
      ],
      myRole: LedgerRole.VIEWER,
    }));

    const { container } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    expect(container.querySelector('[data-settings-row="categories"]')).not.toBeNull();
    expect(container.querySelector('[data-settings-row="tags"]')).toBeNull();
  });

  it('returns an owner to personal detail after archiving the current ledger', async () => {
    hooks.archiveLedger.mockResolvedValue({ data: {} });
    const { container, router } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="archive"]')?.click());

    expect(hooks.archiveLedger).toHaveBeenCalledWith({
      data: { confirmed: true, version: 3 },
      ledgerId: 'ledger/a',
    });
    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });

  it('stays on the settings page when archiving fails', async () => {
    hooks.archiveLedger.mockRejectedValue(new Error('archive failed'));
    const { container, router } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="archive"]')?.click());

    expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/settings');
  });

  it('redirects an archived ledger settings URL to personal detail', async () => {
    hooks.useLedgerQuery.mockReturnValue(query({ ...ledger, status: LedgerStatus.ARCHIVED }));
    const { container, router } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    await act(async () => Promise.resolve());

    expect(router.state.location.pathname).toBe('/detail');
    expect(container.textContent).toContain('personal-detail-target');
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

    expect(container.querySelector<HTMLButtonElement>('[data-settings-row="preferences"]')?.disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('[data-settings-row="categories"]')?.disabled).toBe(false);
    expect(container.querySelector('[data-settings-row="tags"]')).toBeNull();
  });

  it('keeps active member preferences writable without ledger update capability', () => {
    hooks.useLedgerQuery.mockReturnValue(query({
      ...ledger,
      capabilities: [LedgerCapability.LEDGER_READ, LedgerCapability.MEMBER_READ],
      myRole: LedgerRole.BOOKKEEPER,
    }));

    const { container } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    expect(container.querySelector<HTMLButtonElement>('[data-settings-row="preferences"]')?.disabled).toBe(false);
    expect(container.querySelector('[data-settings-row="basic"]')?.tagName).toBe('DIV');
  });

  it('lets a non-owner leave with the current membership version', async () => {
    hooks.useLedgerQuery.mockReturnValue(query({
      ...ledger,
      capabilities: [LedgerCapability.LEDGER_READ, LedgerCapability.MEMBER_READ],
      myRole: LedgerRole.BOOKKEEPER,
    }));
    hooks.leaveLedger.mockResolvedValue({ data: {} });
    const { container, router } = renderPage('/ledgers/ledger%2Fa/settings', '/ledgers/:ledgerId/settings', createElement(LedgerSettingsPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[data-settings-row="leave"]')?.click());

    expect(hooks.leaveLedger).toHaveBeenCalledWith({ ledgerId: 'ledger/a', version: 5 });
    expect(router.state.location.pathname).toBe('/detail');
    expect(router.state.historyAction).toBe('REPLACE');
  });
});

describe('ledger category and tag management', () => {
  it('uses one stable Whale Wave focus treatment for the category name field', async () => {
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));

    await act(async () => {
      [...container.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.add')
        ?.click();
    });

    const field = document.body.querySelector<HTMLElement>('[data-testid="category-name-field"]');
    const input = field?.querySelector<HTMLInputElement>('input');

    expect(field).not.toBeNull();
    expect([
      'min-h-[54px]',
      'focus-within:border-primary-mid',
      'focus-within:ring-2',
      'focus-within:ring-[var(--ww-theme-color-light)]',
      'ww-category-name-field',
    ].every(className => field?.classList.contains(className))).toBe(true);
    expect(input).not.toBeNull();
    act(() => input?.focus());
    expect(document.activeElement).toBe(input);
  });

  it('renames one ledger category inside the URL-scoped ledger', async () => {
    hooks.updateCategory.mockResolvedValue({ version: 2 });
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="categories.edit"]')?.click());
    const input = document.body.querySelector<HTMLInputElement>('[aria-label="categories.name"] input');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, '餐饮新');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      const done = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.done');
      done?.click();
    });
    expect(hooks.updateCategory).toHaveBeenCalledWith({
      categoryId: 1,
      data: { name: '餐饮新', version: 1 },
      ledgerId: 'ledger/a',
    });
  });

  it('renames an image category without replacing its existing icon', async () => {
    hooks.useLedgerCategoriesQuery.mockReturnValue(query([{
      createdAt: '',
      icon: 'https://assets.example.test/category.webp',
      iconType: 'IMAGE',
      id: 1,
      isCustom: true,
      ledgerId: ledger.id,
      name: '旅行',
      sortOrder: 0,
      status: 'ACTIVE',
      type: 'sub',
      updatedAt: '',
      version: 4,
    }]));
    hooks.updateCategory.mockResolvedValue({ version: 5 });
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="categories.edit"]')?.click());
    const input = document.body.querySelector<HTMLInputElement>('[aria-label="categories.name"] input');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input, '远行');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      [...document.body.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.done')
        ?.click();
    });

    expect(hooks.updateCategory).toHaveBeenCalledWith({
      categoryId: 1,
      data: { name: '远行', version: 4 },
      ledgerId: 'ledger/a',
    });
    expect(hooks.uploadCategory).not.toHaveBeenCalled();
  });

  it('hides and restores categories with the server-issued version', async () => {
    const activeCategory = {
      createdAt: '',
      icon: 'meal',
      iconType: 'BUILTIN',
      id: 1,
      isCustom: true,
      ledgerId: ledger.id,
      name: '餐饮',
      sortOrder: 0,
      status: 'ACTIVE',
      type: 'sub',
      updatedAt: '',
      version: 2,
    } as const;
    const secondCategory = {
      ...activeCategory,
      icon: 'traffic',
      id: 2,
      name: '交通',
      sortOrder: 1,
      version: 3,
    } as const;
    hooks.useLedgerCategoriesQuery.mockReturnValue(query([activeCategory, secondCategory]));
    hooks.updateCategory
      .mockResolvedValueOnce({ ...activeCategory, status: 'ARCHIVED', version: 3 })
      .mockResolvedValueOnce({ ...activeCategory, status: 'ACTIVE', sortOrder: -1, version: 4 });
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));

    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="categories.archive"]')?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-expanded="false"]')?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="categories.restoreName"]')?.click());

    expect(hooks.updateCategory).toHaveBeenNthCalledWith(1, {
      categoryId: 1,
      data: { status: 'ARCHIVED', version: 2 },
      ledgerId: 'ledger/a',
    });
    expect(hooks.updateCategory).toHaveBeenNthCalledWith(2, {
      categoryId: 1,
      data: { status: 'ACTIVE', version: 3 },
      ledgerId: 'ledger/a',
    });
  });

  it('keeps row actions mounted while a reorder request is pending', () => {
    const firstCategory = {
      createdAt: '',
      icon: 'meal',
      iconType: 'BUILTIN',
      id: 1,
      isCustom: true,
      ledgerId: ledger.id,
      name: '餐饮',
      sortOrder: 0,
      status: 'ACTIVE',
      type: 'sub',
      updatedAt: '',
      version: 2,
    } as const;
    hooks.useLedgerCategoriesQuery.mockReturnValue(query([
      firstCategory,
      { ...firstCategory, icon: 'traffic', id: 2, name: '交通', sortOrder: 1 },
    ]));
    hooks.useReorderLedgerCategoriesMutation.mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ]);

    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));

    const archiveButtons = container.querySelectorAll<HTMLButtonElement>(
      '[aria-label="categories.archive"]',
    );
    expect(archiveButtons).toHaveLength(2);
    expect([...archiveButtons].every(button => button.disabled)).toBe(true);
    expect([...archiveButtons].every(button => !button.classList.contains('opacity-35')))
      .toBe(true);
    expect(container.querySelectorAll('[aria-label="categories.edit"]')).toHaveLength(2);
  });

  it('previews and uploads the original image for server-side normalization', async () => {
    hooks.useCategoryIconCatalogQuery.mockReturnValue(query([{
      group: 'other',
      key: 'receipt',
      name: { en: 'Receipt', zh: '账单' },
    }]));
    hooks.createCategory.mockResolvedValue({ version: 1 });
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));

    await act(async () => {
      [...container.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.add')
        ?.click();
    });
    const nameInput = document.body.querySelector<HTMLInputElement>('[aria-label="categories.name"] input');
    const fileInput = document.body.querySelector<HTMLInputElement>('input[type="file"]');
    const original = new File(['original-image'], 'original.png', { type: 'image/png' });
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(nameInput, '旅行');
      nameInput?.dispatchEvent(new Event('input', { bubbles: true }));
      Object.defineProperty(fileInput, 'files', { configurable: true, value: [original] });
      fileInput?.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(document.body.querySelector<HTMLImageElement>('img[src="blob:preview"]')).not.toBeNull();
    await act(async () => {
      [...document.body.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.done')
        ?.click();
    });

    expect(hooks.createCategory).toHaveBeenCalledWith(expect.objectContaining({
      data: { file: original, name: '旅行', type: 'sub' },
      ledgerId: 'ledger/a',
    }));
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });

  it('keeps the original image submittable when a local preview URL cannot be created', async () => {
    hooks.createCategory.mockResolvedValue({ version: 1 });
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      throw new Error('preview unavailable');
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));

    await act(async () => {
      [...container.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.add')
        ?.click();
    });
    const nameInput = document.body.querySelector<HTMLInputElement>('[aria-label="categories.name"] input');
    const fileInput = document.body.querySelector<HTMLInputElement>('input[type="file"]');
    const original = new File(['original-image'], 'original.png', { type: 'image/png' });

    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(nameInput, '旅行');
      nameInput?.dispatchEvent(new Event('input', { bubbles: true }));
      Object.defineProperty(fileInput, 'files', { configurable: true, value: [original] });
      fileInput?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const done = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.done');
    expect(done?.disabled).toBe(false);
    await act(async () => done?.click());

    expect(hooks.createCategory).toHaveBeenCalledWith(expect.objectContaining({
      data: { file: original, name: '旅行', type: 'sub' },
      ledgerId: 'ledger/a',
    }));
  });

  it('reports server processing after upload and resets progress immediately on storage failure', async () => {
    let rejectUpload: ((reason?: unknown) => void) | undefined;
    hooks.createCategory.mockImplementation(({ onProgress }) => {
      onProgress?.(1);
      return new Promise((_resolve, reject) => {
        rejectUpload = reject;
      });
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const { container } = renderPage('/ledgers/ledger%2Fa/settings/categories', '/ledgers/:ledgerId/settings/categories', createElement(LedgerCategoriesPage));

    await act(async () => {
      [...container.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.add')
        ?.click();
    });
    const nameInput = document.body.querySelector<HTMLInputElement>('[aria-label="categories.name"] input');
    const fileInput = document.body.querySelector<HTMLInputElement>('input[type="file"]');
    const original = new File(['original-image'], 'original.png', { type: 'image/png' });
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(nameInput, '旅行');
      nameInput?.dispatchEvent(new Event('input', { bubbles: true }));
      Object.defineProperty(fileInput, 'files', { configurable: true, value: [original] });
      fileInput?.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      [...document.body.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => button.textContent === 'categories.done')
        ?.click();
    });
    expect(document.body.textContent).toContain('categories.uploadProcessing');
    await act(async () => rejectUpload?.(Object.assign(new Error('storage unavailable'), {
      code: 'CATEGORY_ICON_STORAGE_UNAVAILABLE',
    })));

    expect(toastShow).toHaveBeenCalledWith(expect.objectContaining({
      content: 'categories.errors.iconStorageUnavailable',
      icon: 'fail',
    }));
    expect(document.body.querySelector('[role="progressbar"]')).toBeNull();
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
