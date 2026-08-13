import type { Asset, AssetGroup } from '@/entities/asset';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetGroupAssetType } from '@/entities/asset';
import AssetManagerPage from '@/pages/asset/asset-manager/AssetManagerPage';

const hooks = vi.hoisted(() => ({
  deleteAsset: vi.fn(),
  refetchGroups: vi.fn(),
  refetchList: vi.fn(),
  useAssetSummaryInfo: vi.fn(),
  useDeleteAssetByIdMutation: vi.fn(),
  useGetAssetGroupQuery: vi.fn(),
  useGetAssetQuery: vi.fn(),
}));

vi.mock('@/entities/asset', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/asset')>();
  return {
    ...actual,
    useAssetSummaryInfo: hooks.useAssetSummaryInfo,
    useDeleteAssetByIdMutation: hooks.useDeleteAssetByIdMutation,
    useGetAssetGroupQuery: hooks.useGetAssetGroupQuery,
    useGetAssetQuery: hooks.useGetAssetQuery,
  };
});

const parentGroup: AssetGroup = {
  assetType: AssetGroupAssetType.NORMAL,
  createdAt: '2026-08-01T00:00:00.000Z',
  description: '',
  fixedName: true,
  icon: 'cash',
  id: 'cash-group',
  level: 1,
  name: '现金账户',
  parentId: '',
  type: 'add',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const childGroup: AssetGroup = {
  ...parentGroup,
  id: 'wallet-group',
  level: 2,
  name: '现金钱包',
  parentId: parentGroup.id,
};

const asset: Asset = {
  amount: '1280.5',
  assetGroup: childGroup,
  cardId: '1024',
  comment: '日常消费',
  createdAt: '2026-08-01T00:00:00.000Z',
  id: 'asset-1',
  name: '随身钱包',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

let cleanup: (() => void) | undefined;

function renderPage() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([
    { path: '/asset', element: createElement(AssetManagerPage) },
    { path: '/asset/add-account', element: createElement('div', null, 'add-account-target') },
    { path: '/asset/chart', element: createElement('div', null, 'chart-target') },
    { path: '/asset/detail/:id', element: createElement('div', null, 'detail-target') },
  ], { initialEntries: ['/origin', '/asset'], initialIndex: 1 });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(() => {
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useAssetSummaryInfo.mockReturnValue({
    formatInfo: { addAsset: '1500.00', subAsset: '200.00', totalAsset: '1300.00' },
  });
  hooks.useDeleteAssetByIdMutation.mockReturnValue([hooks.deleteAsset, { isLoading: false }]);
  hooks.useGetAssetGroupQuery.mockReturnValue({
    data: [parentGroup, childGroup],
    isError: false,
    isLoading: false,
    refetch: hooks.refetchGroups,
  });
  hooks.useGetAssetQuery.mockReturnValue({
    data: [asset],
    isError: false,
    isLoading: false,
    refetch: hooks.refetchList,
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('asset manager page', () => {
  it('renders the new summary and grouped account list and opens account details', async () => {
    const { container, router } = renderPage();

    expect(container.textContent).toContain('1300.00');
    expect(container.textContent).toContain('现金账户');
    expect(container.textContent).toContain('随身钱包');
    expect(container.textContent).toContain('¥1280.50');

    const accountButton = [...container.querySelectorAll('button')]
      .find(button => button.textContent?.includes('随身钱包'));
    await act(async () => accountButton?.click());

    expect(router.state.location.pathname).toBe('/asset/detail/asset-1');
  });

  it('uses the shared empty state and preserves add-account navigation', async () => {
    hooks.useGetAssetQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
      refetch: hooks.refetchList,
    });
    const { container, router } = renderPage();

    expect(container.querySelector('[data-testid="asset-empty-state"]')).not.toBeNull();
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="asset-add-account"]')?.click());

    expect(router.state.location.pathname).toBe('/asset/add-account');
  });

  it('uses the shared floating tab bar to open asset charts', async () => {
    const { container, router } = renderPage();

    await act(async () => container.querySelector<HTMLButtonElement>('[data-tab-key="chart"]')?.click());

    expect(router.state.location.pathname).toBe('/asset/chart');
  });
});
