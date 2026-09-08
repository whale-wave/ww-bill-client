import type { ReactNode } from 'react';
import type { Asset } from '@/entities/asset';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetGroupAssetType } from '@/entities/asset';
import { AssetTransferPopup } from '@/pages/asset/asset-detail/ui';
import { changeLanguage } from '@/shared/i18n';

const hooks = vi.hoisted(() => ({
  createTransfer: vi.fn(),
  useGetAssetGroupQuery: vi.fn(),
  useGetAssetQuery: vi.fn(),
  usePostAssetTransferMutation: vi.fn(),
}));

vi.mock('@/entities/asset', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/asset')>();

  return {
    ...actual,
    useGetAssetGroupQuery: hooks.useGetAssetGroupQuery,
    useGetAssetQuery: hooks.useGetAssetQuery,
    usePostAssetTransferMutation: hooks.usePostAssetTransferMutation,
  };
});

vi.mock('@/shared/ui', () => ({
  AppSheet: ({ children, visible }: { children: ReactNode; visible?: boolean }) => visible
    ? createElement('section', { 'data-testid': 'bottom-sheet' }, children)
    : null,
  SheetHeader: ({ onClose, title }: { onClose: () => void; title: string }) => createElement(
    'header',
    null,
    createElement('h2', null, title),
    createElement('button', { onClick: onClose, type: 'button' }, 'close'),
  ),
}));

const sourceAsset: Asset = {
  amount: '68992',
  assetGroup: {
    assetType: AssetGroupAssetType.NORMAL,
    createdAt: '',
    description: '',
    fixedName: false,
    icon: 'cash',
    id: 'cash-group',
    level: 2,
    name: '现金',
    parentId: 'asset-group',
    type: 'add',
    updatedAt: '',
  },
  createdAt: '',
  id: 'asset-source',
  name: '现金',
  updatedAt: '',
};

const targetAsset: Asset = {
  ...sourceAsset,
  amount: '50000',
  assetGroup: {
    ...sourceAsset.assetGroup,
    assetType: AssetGroupAssetType.BANK,
    id: 'bank-group',
    name: '中信银行',
    parentId: 'savings-group',
  },
  id: 'asset-target',
  name: '中信银行',
};

let cleanup: (() => void) | undefined;

beforeEach(async () => {
  await changeLanguage('zh-CN');
  hooks.useGetAssetGroupQuery.mockReturnValue({
    data: [{
      ...targetAsset.assetGroup,
      id: 'savings-group',
      level: 0,
      name: '储蓄卡',
      parentId: '',
    }],
  });
  hooks.useGetAssetQuery.mockReturnValue({ data: [sourceAsset, targetAsset] });
  hooks.usePostAssetTransferMutation.mockReturnValue([
    hooks.createTransfer,
    { isLoading: false },
  ]);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('asset transfer popup', () => {
  it('uses a custom account picker and keeps the amount focus style on the outer field', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() => root.render(createElement(AssetTransferPopup, {
      asset: sourceAsset,
      onClose: vi.fn(),
      visible: true,
    })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('select')).toBeNull();
    const targetTrigger = container.querySelector<HTMLButtonElement>('[data-asset-transfer-target-trigger]');
    expect(targetTrigger?.getAttribute('aria-haspopup')).toBe('dialog');

    act(() => targetTrigger?.click());
    const targetOption = container.querySelector<HTMLButtonElement>('[data-asset-transfer-target-option="asset-target"]');
    expect(targetOption?.textContent).toContain('中信银行');
    expect(targetOption?.textContent).toContain('储蓄卡');

    act(() => targetOption?.click());
    expect(targetTrigger?.textContent).toContain('中信银行');
    expect(targetTrigger?.textContent).toContain('储蓄卡');
    expect(targetTrigger?.getAttribute('aria-expanded')).toBe('false');

    const amountInput = container.querySelector<HTMLInputElement>('#asset-transfer-amount');
    expect(amountInput?.classList).toContain('ww-sheet-plain-input');
  });
});
