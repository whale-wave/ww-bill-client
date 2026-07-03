import type { AssetStatisticalRecordType } from './types';
import { request } from '@/shared/api';

export interface AssetStatisticalRecord {
  id: string;
  type: AssetStatisticalRecordType;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
  fixedName: boolean;
  type: 'add' | 'sub';
  assetType: AssetGroupAssetType;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  comment?: string;
  cardId?: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  assetGroup: AssetGroup;
}

export interface AssetRecord {
  id: string;
  name: string;
  type: string;
  comment: string;
  amount: string;
  beforeAmount: string;
  afterAmount: string;
  createdAt: string;
  updatedAt: string;
  asset: Asset;
}

export enum AssetGroupAssetType {
  NORMAL = 'normal',
  BANK = 'bank',
  CREDIT = 'credit',
}

export const CARD_TYPE = [AssetGroupAssetType.BANK, AssetGroupAssetType.CREDIT] as const;

export function getAssetGroupByIdApi(id: string) {
  return request.get<unknown, SuccessResponse<AssetGroup>>(`/asset/group/${id}`);
}

export function getAssetGroupApi() {
  return request.get<unknown, SuccessResponse<AssetGroup[]>>('/asset/group');
}

export interface PostAssetApiData extends Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'assetGroup'> {
  groupId: string;
}
export function postAssetApi(data: PostAssetApiData) {
  return request.post<unknown, SuccessResponse<Asset>>('/asset', data);
}

export function deleteAssetByIdApi(id: string) {
  return request.delete<unknown, SuccessResponse<Asset>>(`/asset/${id}`);
}

export interface PatchAssetAdjustApiData extends Partial<Pick<Asset, 'name' | 'comment' | 'amount'>> {}
export function patchAssetAdjustApi(id: string, data: PatchAssetAdjustApiData) {
  return request.patch<unknown, SuccessResponse<Asset>>(`/asset/adjust/${id}`, data);
}

export function getAssetApi() {
  return request.get<unknown, SuccessResponse<Asset[]>>('/asset');
}

export function getAssetByIdApi(id: string) {
  return request.get<unknown, SuccessResponse<Asset>>(`/asset/${id}`);
}

export interface GetAssetRecordApiParams {
  assetId: string;
  startTime: number;
  endTime: number;
}
export function getAssetRecordApi(params: GetAssetRecordApiParams) {
  return request.get<unknown, SuccessResponse<AssetRecord[]>>(`/asset/record`, {
    params,
  });
}

export interface GetAssetStatisticalRecordApiParams {
  type: AssetStatisticalRecordType;
  startTime: number;
  endTime: number;
}
export function getAssetStatisticalRecordApi(params: GetAssetStatisticalRecordApiParams) {
  return request.get<unknown, SuccessResponse<AssetStatisticalRecord[]>>(`/asset/statistical`, {
    params,
  });
}
