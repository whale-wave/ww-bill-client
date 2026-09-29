import type { Asset, AssetGroup } from '@/entities/asset';
import { money } from '@/shared/lib/amount';

export interface AssetSankeyNode {
  id: string;
  label: string;
  amount: string;
  depth: number;
  tone: 'asset' | 'liability' | 'net' | 'group';
}

export interface AssetSankeyLink {
  source: string;
  target: string;
  amount: string;
}

function getCategory(group: AssetGroup, groups: Map<string, AssetGroup>) {
  // Bank names are leaf groups; their parent is the meaningful account type.
  return groups.get(group.parentId) ?? group;
}

export function buildAssetSankey(assets: Asset[], groups: AssetGroup[], labels: {
  totalAsset: string;
  netAsset: string;
  deficit: string;
  assetSide: string;
}) {
  const nodes: AssetSankeyNode[] = [];
  const links: AssetSankeyLink[] = [];
  const groupMap = new Map(groups.map(group => [group.id, group]));
  const categories = new Map<string, AssetSankeyNode>();
  let assetTotal = '0';
  let liabilityTotal = '0';
  let positiveAssets = '0';
  let positiveLiabilities = '0';
  let hasNegativeBalances = false;

  for (const asset of assets) {
    if (!Number.isFinite(Number(asset.amount)))
      continue;
    const isAsset = asset.assetGroup.type === 'add';
    if (isAsset)
      assetTotal = money.add(assetTotal, asset.amount);
    else
      liabilityTotal = money.add(liabilityTotal, asset.amount);
    const sign = money.compare(asset.amount, '0');
    if (sign === 0)
      continue;
    const amount = sign < 0 ? money.subtract('0', asset.amount) : asset.amount;
    const isAssetSide = sign < 0 ? !isAsset : isAsset;
    hasNegativeBalances ||= sign < 0;

    if (!isAssetSide) {
      positiveLiabilities = money.add(positiveLiabilities, amount);
      nodes.push({ id: `liability:${asset.id}`, label: asset.name, amount, depth: 0, tone: 'liability' });
      links.push({ source: `liability:${asset.id}`, target: 'total', amount });
      continue;
    }

    positiveAssets = money.add(positiveAssets, amount);
    const category = getCategory(asset.assetGroup, groupMap);
    const categoryId = `group:${category.id}`;
    const existing = categories.get(categoryId);
    if (existing)
      existing.amount = money.add(existing.amount, amount);
    else
      categories.set(categoryId, { id: categoryId, label: category.name, amount, depth: 2, tone: 'group' });
    nodes.push({ id: `account:${asset.id}`, label: asset.name, amount, depth: 3, tone: 'asset' });
    links.push({ source: categoryId, target: `account:${asset.id}`, amount });
  }

  const netAsset = money.subtract(assetTotal, liabilityTotal);
  const deficit = money.compare(netAsset, '0') < 0 ? money.subtract('0', netAsset) : '0';
  const flowTotal = money.compare(positiveAssets, positiveLiabilities) >= 0 ? positiveAssets : positiveLiabilities;
  if (money.compare(flowTotal, '0') > 0) {
    nodes.push({
      id: 'total',
      label: hasNegativeBalances || money.compare(deficit, '0') > 0 ? labels.assetSide : labels.totalAsset,
      amount: flowTotal,
      depth: 1,
      tone: 'asset',
    });
    if (money.compare(netAsset, '0') > 0) {
      nodes.push({ id: 'net', label: labels.netAsset, amount: netAsset, depth: 0, tone: 'net' });
      links.push({ source: 'net', target: 'total', amount: netAsset });
    }
    if (money.compare(deficit, '0') > 0) {
      nodes.push({ id: 'deficit', label: labels.deficit, amount: deficit, depth: 2, tone: 'liability' });
      links.push({ source: 'total', target: 'deficit', amount: deficit });
    }
    for (const category of categories.values()) {
      nodes.push(category);
      links.push({ source: 'total', target: category.id, amount: category.amount });
    }
  }

  return { nodes, links, assetTotal, liabilityTotal, netAsset, flowTotal, deficit, hasNegativeBalances };
}
