import type { Asset } from '@/entities/asset';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAssetSummaryInfo } from '@/entities/asset';

const hooks = vi.hoisted(() => ({
  useGetAssetQuery: vi.fn(),
}));

vi.mock('@/entities/asset/hooks', () => ({
  useGetAssetQuery: hooks.useGetAssetQuery,
}));

function SummaryProbe() {
  const summary = useAssetSummaryInfo();
  return createElement('output', {
    'data-add-percent': String(summary.addAssetGroupPercent[0]?.percent ?? ''),
    'data-sub-percent': String(summary.subAssetGroupPercent[0]?.percent ?? ''),
  });
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('asset summary', () => {
  it('keeps zero-value group percentages finite', () => {
    const zeroAsset = {
      amount: '0',
      assetGroup: { id: 'asset-group', type: 'add' },
    } as Asset;
    const zeroLiability = {
      amount: '0',
      assetGroup: { id: 'liability-group', type: 'sub' },
    } as Asset;
    hooks.useGetAssetQuery.mockReturnValue({ data: [zeroAsset, zeroLiability] });

    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    root.render(createElement(SummaryProbe));

    const output = container.querySelector('output');
    expect(output?.getAttribute('data-add-percent')).toBe('0');
    expect(output?.getAttribute('data-sub-percent')).toBe('0');
    root.unmount();
  });
});
