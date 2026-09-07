import type { Asset, AssetGroup } from '../api';

export function getAssetAccountTypeLabel(asset: Pick<Asset, 'assetGroup'>, groups: AssetGroup[]) {
  const parentGroupId = asset.assetGroup.parentId;

  if (!parentGroupId)
    return asset.assetGroup.name;

  return groups.find(group => group.id === parentGroupId)?.name ?? asset.assetGroup.name;
}
