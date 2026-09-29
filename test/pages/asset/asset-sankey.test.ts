import type { Asset } from '@/entities/asset';
import { describe, expect, it } from 'vitest';
import { overviewDemoAssets, overviewDemoGroups } from '@/pages/asset/asset-chart/model/asset-overview-demo';
import { buildAssetSankey } from '@/pages/asset/asset-chart/model/asset-sankey';
import { money } from '@/shared/lib/amount';

const labels = { totalAsset: '总资产', netAsset: '净资产', deficit: '缺口', assetSide: '资产与缺口' };
const base = overviewDemoAssets[0];

function account(id: string, amount: string, type: 'add' | 'sub' = 'add'): Asset {
  return { ...base, id, name: '同名账户', amount, assetGroup: { ...base.assetGroup, type } };
}

function expectBalanced(model: ReturnType<typeof buildAssetSankey>) {
  for (const node of model.nodes) {
    const incoming = model.links.filter(link => link.target === node.id);
    const outgoing = model.links.filter(link => link.source === node.id);
    const sum = (links: typeof incoming) => links.reduce((total, link) => money.add(total, link.amount), '0');
    if (incoming.length)
      expect(money.compare(sum(incoming), node.amount)).toBe(0);
    if (outgoing.length)
      expect(money.compare(sum(outgoing), node.amount)).toBe(0);
  }
  expect(model.links.every(link => Number(link.amount) > 0)).toBe(true);
  expect(new Set(model.nodes.map(node => node.id)).size).toBe(model.nodes.length);
}

describe('asset overview financial graph', () => {
  it('balances liabilities plus net worth against grouped assets', () => {
    const model = buildAssetSankey(overviewDemoAssets, overviewDemoGroups, labels);
    expect(model.assetTotal).toBe('11822800');
    expect(model.liabilityTotal).toBe('5139000');
    expect(model.netAsset).toBe('6683800');
    expectBalanced(model);
  });

  it('keeps decimal sums exact and allows repeated display names', () => {
    const model = buildAssetSankey([account('a', '0.1'), account('b', '0.2')], [], labels);
    expect(model.assetTotal).toBe('0.3');
    expect(model.nodes.filter(node => node.depth === 3)).toHaveLength(2);
    expectBalanced(model);
  });

  it('represents negative net worth as a deficit without negative widths', () => {
    const model = buildAssetSankey([account('a', '50'), account('b', '100', 'sub')], [], labels);
    expect(model.netAsset).toBe('-50');
    expect(model.nodes.find(node => node.id === 'deficit')?.amount).toBe('50');
    expect(model.nodes.some(node => node.id === 'net')).toBe(false);
    expectBalanced(model);
  });

  it('handles a liability-only portfolio', () => {
    const model = buildAssetSankey([account('a', '100', 'sub')], [], labels);
    expect(model.deficit).toBe('100');
    expectBalanced(model);
  });

  it('moves signed balances to the opposite side while preserving signed summary totals', () => {
    const model = buildAssetSankey([
      account('a', '100'),
      account('b', '-20'),
      account('c', '50', 'sub'),
      account('d', '-10', 'sub'),
    ], [], labels);
    expect(model.assetTotal).toBe('80');
    expect(model.liabilityTotal).toBe('40');
    expect(model.netAsset).toBe('40');
    expect(model.hasNegativeBalances).toBe(true);
    expectBalanced(model);
  });

  it('does not create a zero-valued net worth node when assets equal liabilities', () => {
    const model = buildAssetSankey([account('a', '100'), account('b', '100', 'sub')], [], labels);
    expect(model.nodes.some(node => node.id === 'net' || node.id === 'deficit')).toBe(false);
    expectBalanced(model);
  });

  it('groups bank leaves under their parent account type', () => {
    const parent = { ...base.assetGroup, id: 'bank-type', name: '储蓄卡' };
    const leaf = { ...base.assetGroup, id: 'bank-name', parentId: parent.id, name: '银行' };
    const model = buildAssetSankey([{ ...base, assetGroup: leaf }], [parent, leaf], labels);
    expect(model.nodes.find(node => node.tone === 'group')?.label).toBe('储蓄卡');
    expectBalanced(model);
  });

  it('returns an empty graph for empty or zero-valued accounts', () => {
    expect(buildAssetSankey([], [], labels).links).toEqual([]);
    expect(buildAssetSankey([account('a', '0')], [], labels).nodes).toEqual([]);
  });
});
