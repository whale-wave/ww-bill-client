import type { Asset, AssetGroup } from '@/entities/asset';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetGroupAssetType } from '@/entities/asset';
import { DefaultAssetPickerSheet } from '@/pages/settings/ui/DefaultAssetPickerSheet';

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));

const assetGroups: AssetGroup[] = [{
  assetType: AssetGroupAssetType.CREDIT,
  createdAt: '',
  description: '',
  fixedName: true,
  icon: 'credit',
  id: '00000000-0000-4000-8000-000000000400',
  level: 1,
  name: '信用账户',
  parentId: '',
  type: 'sub',
  updatedAt: '',
}];
const assets: Asset[] = [{
  amount: '328.60',
  assetGroup: assetGroups[0]!,
  createdAt: '',
  id: '00000000-0000-4000-8000-000000000401',
  name: '花呗支付',
  updatedAt: '',
}];
let cleanup: (() => void) | undefined;

function renderPicker(onSelect: (assetId: string | null) => void) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(DefaultAssetPickerSheet, {
    assetGroups,
    assets,
    isError: false,
    isLoading: false,
    isSaving: false,
    onClose: vi.fn(),
    onSelect,
    selectedAssetId: null,
    visible: true,
  })));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
}

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('default asset picker sheet', () => {
  it('lets the user select an asset account or return to manual selection', () => {
    const onSelect = vi.fn();
    renderPicker(onSelect);

    act(() => document.querySelector<HTMLButtonElement>(
      '[data-default-asset-option="00000000-0000-4000-8000-000000000401"]',
    )?.click());
    act(() => document.querySelector<HTMLButtonElement>(
      '[data-default-asset-option="none"]',
    )?.click());

    expect(onSelect).toHaveBeenNthCalledWith(
      1,
      '00000000-0000-4000-8000-000000000401',
    );
    expect(onSelect).toHaveBeenNthCalledWith(2, null);
  });
});
