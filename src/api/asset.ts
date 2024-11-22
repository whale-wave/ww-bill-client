import { request } from '@/utils';

export interface Asset {
  id: string;
  name: string;
  comment?: string;
  amount: string;
}

export interface AssetGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

export function getAssetGroupApi() {
  return request.get<unknown, SuccessResponse<AssetGroup[]>>('/asset/group');
}

export interface PostAssetApiData extends Omit<Asset, 'id'> {
  groupId: string;
}
export function postAssetApi(data: PostAssetApiData) {
  return request.post<unknown, SuccessResponse<Asset>>('/asset', data);
}
