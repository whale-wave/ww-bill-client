import type { Asset, AssetStatisticalRecordType } from '@/entities/asset';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetGroupAssetType } from '@/entities/asset';
import AssetChartPage from '@/pages/asset/asset-chart/AssetChartPage';
import AssetFormInfoPage from '@/pages/asset/asset-form-info/AssetFormInfoPage';
import { changeLanguage } from '@/shared/i18n';

const hooks = vi.hoisted(() => ({
  patchAsset: vi.fn(),
  postAsset: vi.fn(),
  refetchAsset: vi.fn(),
  refetchGroup: vi.fn(),
  useGetAssetByIdQuery: vi.fn(),
  useGetAssetGroupById: vi.fn(),
  usePatchAssetAdjustMutation: vi.fn(),
  usePostAssetMutation: vi.fn(),
}));

vi.mock('@/entities/asset', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/asset')>();
  return {
    ...actual,
    useGetAssetByIdQuery: hooks.useGetAssetByIdQuery,
    useGetAssetGroupById: hooks.useGetAssetGroupById,
    usePatchAssetAdjustMutation: hooks.usePatchAssetAdjustMutation,
    usePostAssetMutation: hooks.usePostAssetMutation,
  };
});

vi.mock('@/pages/asset/asset-chart/ui', () => ({
  AssetRanking: ({ type }: { type: AssetStatisticalRecordType }) => createElement('div', { 'data-testid': 'asset-ranking', 'data-type': type }),
  AssetTrendChart: ({ type }: { type: AssetStatisticalRecordType }) => createElement('div', { 'data-testid': 'asset-trend', 'data-type': type }),
  CurAssetStatus: ({ type }: { type: AssetStatisticalRecordType }) => createElement('div', { 'data-testid': 'asset-status', 'data-type': type }),
  CurNetAssetStatus: () => createElement('div', { 'data-testid': 'net-asset-status' }),
}));

vi.mock('@/pages/asset/asset-manager/ui', () => ({
  AssetTabBar: ({ activeKey }: { activeKey: string }) => createElement('div', { 'data-active-key': activeKey, 'data-testid': 'asset-tab-bar' }),
}));

const bankAsset: Asset = {
  amount: '5200.35',
  assetGroup: {
    assetType: AssetGroupAssetType.BANK,
    createdAt: '2026-08-01T00:00:00.000Z',
    description: '工资账户',
    fixedName: false,
    icon: 'bank-card',
    id: 'bank-group',
    level: 2,
    name: '银行卡',
    parentId: 'asset-group',
    type: 'add',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  cardId: '1024',
  comment: '主账户',
  createdAt: '2026-08-01T00:00:00.000Z',
  id: 'asset-1',
  name: '工资卡',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

let cleanup: (() => void) | undefined;

function renderRoute(path: string, routePath: string, element: React.ReactNode) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([{ element, path: routePath }], { initialEntries: [path] });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(async () => {
  await changeLanguage('zh-CN');
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useGetAssetByIdQuery.mockReturnValue({
    data: bankAsset,
    isError: false,
    isLoading: false,
    refetch: hooks.refetchAsset,
  });
  hooks.useGetAssetGroupById.mockReturnValue({
    data: undefined,
    isError: false,
    isLoading: false,
    refetch: hooks.refetchGroup,
  });
  hooks.usePatchAssetAdjustMutation.mockReturnValue([hooks.patchAsset, { isLoading: false }]);
  hooks.usePostAssetMutation.mockReturnValue([hooks.postAsset, { isLoading: false }]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
});

describe('asset information form', () => {
  it('uses the edited asset group without enabling an empty group request and restores the card id', async () => {
    const { container } = renderRoute(
      '/asset/add-form/asset-1',
      '/asset/add-form/:id',
      createElement(AssetFormInfoPage),
    );

    await act(async () => {});

    expect(hooks.useGetAssetGroupById).toHaveBeenCalledWith({
      options: { enabled: false },
      params: '',
    });
    expect(hooks.useGetAssetByIdQuery).toHaveBeenCalledWith({
      options: { enabled: true },
      params: 'asset-1',
    });
    expect(container.querySelector<HTMLInputElement>('input[aria-label="卡号 (后四位)"]')?.value).toBe('1024');
    expect(container.querySelector<HTMLInputElement>('input[aria-label="所在银行"]')?.value).toBe('工资卡');
  });
});

describe('asset chart URL state', () => {
  it('uses a valid type from the URL', () => {
    const { container } = renderRoute(
      '/asset/chart?type=liability',
      '/asset/chart',
      createElement(AssetChartPage),
    );

    expect(container.querySelector('[data-testid="asset-trend"]')?.getAttribute('data-type')).toBe('liability');
    expect(container.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('负债');
  });

  it('falls back to assets for an invalid URL type', () => {
    const { container } = renderRoute(
      '/asset/chart?type=unknown',
      '/asset/chart',
      createElement(AssetChartPage),
    );

    expect(container.querySelector('[data-testid="asset-trend"]')?.getAttribute('data-type')).toBe('asset');
    expect(container.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('资产');
  });

  it('synchronizes tab changes back to the URL', async () => {
    const { container, router } = renderRoute(
      '/asset/chart?type=asset',
      '/asset/chart',
      createElement(AssetChartPage),
    );
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    await act(async () => tabs[2]?.click());

    expect(router.state.location.search).toBe('?type=net_asset');
    expect(container.querySelector('[data-testid="asset-trend"]')?.getAttribute('data-type')).toBe('net_asset');
    expect(container.querySelector('[data-testid="net-asset-status"]')).not.toBeNull();
  });
});
