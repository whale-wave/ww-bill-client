import type { Asset, AssetRecord } from '@/entities/asset';
import { Dialog } from 'antd-mobile';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetGroupAssetType } from '@/entities/asset';
import AssetDetailPage from '@/pages/asset/asset-detail/AssetDetailPage';
import { changeLanguage } from '@/shared/i18n';

const hooks = vi.hoisted(() => ({
  deleteAsset: vi.fn(),
  patchAsset: vi.fn(),
  refetchDetail: vi.fn(),
  refetchRecords: vi.fn(),
  useDeleteAssetByIdMutation: vi.fn(),
  useGetAssetByIdQuery: vi.fn(),
  useGetAssetRecordQuery: vi.fn(),
  usePatchAssetAdjustMutation: vi.fn(),
}));

vi.mock('antd-mobile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd-mobile')>();
  const { createElement } = await import('react');

  return {
    ...actual,
    Skeleton: {
      Paragraph: () => createElement('div', { 'data-testid': 'asset-detail-loading-lines' }),
      Title: () => createElement('div', { 'data-testid': 'asset-detail-loading' }),
    },
  };
});

vi.mock('@/entities/asset', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/asset')>();
  return {
    ...actual,
    useDeleteAssetByIdMutation: hooks.useDeleteAssetByIdMutation,
    useGetAssetByIdQuery: hooks.useGetAssetByIdQuery,
    useGetAssetRecordQuery: hooks.useGetAssetRecordQuery,
    usePatchAssetAdjustMutation: hooks.usePatchAssetAdjustMutation,
  };
});

const asset: Asset = {
  amount: '1280.5',
  assetGroup: {
    assetType: AssetGroupAssetType.BANK,
    createdAt: '2026-08-01T00:00:00.000Z',
    description: '日常银行卡',
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
  comment: '日常消费',
  createdAt: '2026-08-01T00:00:00.000Z',
  id: 'asset-1',
  name: '工资卡',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

const record: AssetRecord = {
  afterAmount: '1280.5',
  amount: '80.5',
  asset,
  beforeAmount: '1200',
  comment: '月末校准',
  createdAt: '2026-08-14T08:00:00.000Z',
  id: 'record-1',
  name: '手动调整余额',
  type: 'add',
  updatedAt: '2026-08-14T08:00:00.000Z',
};

let cleanup: (() => void) | undefined;

function renderPage() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const router = createMemoryRouter([
    { element: createElement(AssetDetailPage), path: '/asset/detail/:id' },
    { element: createElement('div', null, 'edit-target'), path: '/asset/add-form/:id' },
  ], { initialEntries: ['/asset/detail/asset-1'] });

  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return { container, router };
}

beforeEach(async () => {
  await changeLanguage('zh-CN');
  Object.values(hooks).forEach(mock => mock.mockReset());
  hooks.useDeleteAssetByIdMutation.mockReturnValue([hooks.deleteAsset, { isLoading: false }]);
  hooks.usePatchAssetAdjustMutation.mockReturnValue([hooks.patchAsset, { isLoading: false }]);
  hooks.useGetAssetByIdQuery.mockReturnValue({
    data: asset,
    isError: false,
    isLoading: false,
    refetch: hooks.refetchDetail,
  });
  hooks.useGetAssetRecordQuery.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
    refetch: hooks.refetchRecords,
  });
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('asset detail page', () => {
  it('renders account information and the localized empty record state', () => {
    const { container } = renderPage();

    expect(container.querySelector('[data-page-header]')).not.toBeNull();
    expect(container.textContent).toContain('工资卡');
    expect(container.textContent).toContain('1280.50');
    expect(container.textContent).toContain('本月暂无变动记录');
    expect(hooks.useGetAssetRecordQuery).toHaveBeenCalledWith(expect.objectContaining({
      params: expect.objectContaining({ assetId: 'asset-1' }),
    }));
  });

  it('keeps a dedicated loading state before rendering account content', () => {
    hooks.useGetAssetByIdQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
      refetch: hooks.refetchDetail,
    });
    const { container } = renderPage();

    expect(container.querySelector('[data-testid="asset-detail-loading"]')).not.toBeNull();
    expect(container.textContent).not.toContain('工资卡');
    expect(hooks.useGetAssetRecordQuery).not.toHaveBeenCalled();
  });

  it('shows a retryable error state when the detail request fails', async () => {
    hooks.useGetAssetByIdQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      refetch: hooks.refetchDetail,
    });
    const { container } = renderPage();

    expect(container.textContent).toContain('资产详情加载失败');
    const retryButton = [...container.querySelectorAll('button')]
      .find(button => button.textContent?.includes('重试'));
    await act(async () => retryButton?.click());

    expect(hooks.refetchDetail).toHaveBeenCalledOnce();
  });

  it('opens the styled record information dialog for a change record', async () => {
    hooks.useGetAssetRecordQuery.mockReturnValue({
      data: [record],
      isError: false,
      isLoading: false,
      refetch: hooks.refetchRecords,
    });
    const alert = vi.spyOn(Dialog, 'alert').mockResolvedValue();
    const { container } = renderPage();
    const recordButton = [...container.querySelectorAll('button')]
      .find(button => button.textContent?.includes(record.name));

    await act(async () => recordButton?.click());

    expect(alert).toHaveBeenCalledWith(expect.objectContaining({
      bodyClassName: 'ww-app-dialog ww-app-dialog--primary',
      header: expect.anything(),
    }));
  });
});
