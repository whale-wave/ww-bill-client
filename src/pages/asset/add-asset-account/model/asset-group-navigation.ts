import { ROUTES_PATH } from '@/shared/config/routes';

export function getAssetGroupParentId(query: URLSearchParams) {
  return query.get('parentId');
}

interface NavigableAssetGroup {
  assetType: string;
  id: string;
  parentId?: string | null;
  type: 'add' | 'sub';
}

export function getAssetGroupNavigationPath(item: Omit<NavigableAssetGroup, 'parentId'>, groups: NavigableAssetGroup[]) {
  if (groups.some(group => group.parentId === item.id))
    return `${ROUTES_PATH.ASSET_ADD_ACCOUNT.getPath()}?parentId=${item.id}`;

  return `${ROUTES_PATH.ASSET_ADD_FORM.getPath()}?groupId=${item.id}&assetType=${item.assetType}&type=${item.type}`;
}
