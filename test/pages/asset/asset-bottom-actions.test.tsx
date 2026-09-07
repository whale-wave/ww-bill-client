import type { Asset } from '@/entities/asset';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetGroupAssetType } from '@/entities/asset';
import { AssetBottomActions } from '@/pages/asset/asset-detail/ui/AssetBottomActions';

const hooks = vi.hoisted(() => ({
  deleteAsset: vi.fn(),
  useDeleteAssetByIdMutation: vi.fn(),
}));

vi.mock('@/entities/asset', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/asset')>();

  return {
    ...actual,
    useDeleteAssetByIdMutation: hooks.useDeleteAssetByIdMutation,
  };
});

vi.mock('@/pages/asset/asset-detail/ui/AssetTransferPopup', () => ({
  AssetTransferPopup: ({ onClose, visible }: { onClose: () => void; visible: boolean }) => createElement(
    'div',
    { 'data-testid': 'asset-transfer-popup', 'data-visible': String(visible) },
    createElement('button', { onClick: onClose, type: 'button' }, 'close transfer'),
  ),
}));

const asset: Asset = {
  amount: '115',
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

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('asset bottom actions', () => {
  it('keeps the transfer popup mounted so its visible state can animate', () => {
    hooks.useDeleteAssetByIdMutation.mockReturnValue([hooks.deleteAsset, { isLoading: false }]);
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    act(() => root.render(createElement(MemoryRouter, null, createElement(AssetBottomActions, { asset }))));
    cleanup = () => act(() => root.unmount());

    const popup = container.querySelector<HTMLElement>('[data-testid="asset-transfer-popup"]');
    expect(popup?.dataset.visible).toBe('false');

    const transfer = [...container.querySelectorAll<HTMLButtonElement>('footer button')]
      .find(button => button.textContent === '转账');
    act(() => transfer?.click());

    expect(container.querySelector('[data-testid="asset-transfer-popup"]')).toBe(popup);
    expect(popup?.dataset.visible).toBe('true');
  });
});
