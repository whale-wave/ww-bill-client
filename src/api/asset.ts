import { request } from '@/utils';

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
