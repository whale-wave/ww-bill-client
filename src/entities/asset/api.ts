import type { AssetStatisticalRecordType } from './types';
import type { SuccessResponse } from '@/shared/api';
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
  occurredAt?: string;
  sourceType?: 'BOOKKEEPING' | 'MANUAL_ADJUSTMENT' | 'TRANSFER';
  status?: 'ACTIVE' | 'VOIDED';
  transferSide?: 'IN' | 'OUT';
  counterpartyNameSnapshot?: string;
  linkedRecordId?: number;
  transfer?: {
    canVoid: boolean;
    id: string;
    status: 'ACTIVE' | 'VOIDED';
    version: number;
  };
  asset: Asset;
}

export interface AssetTransfer {
  id: string;
  amount: string;
  occurredAt: string;
  sourceAssetId?: string;
  sourceName: string;
  status: 'ACTIVE' | 'VOIDED';
  targetAssetId?: string;
  targetName: string;
  version: number;
}

export interface PostAssetTransferApiData {
  sourceAssetId: string;
  targetAssetId: string;
  amount: string;
  occurredAt: string;
  idempotencyKey: string;
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

export interface PatchAssetAdjustApiData extends Partial<Pick<Asset, 'name' | 'comment' | 'amount' | 'cardId'>> {}
export function patchAssetAdjustApi(id: string, data: PatchAssetAdjustApiData) {
  return request.patch<unknown, SuccessResponse<Asset>>(`/asset/adjust/${id}`, data);
}

export function getAssetApi() {
  return request.get<unknown, SuccessResponse<Asset[]>>('/asset');
}

export function getAssetByIdApi(id: string) {
  return request.get<unknown, SuccessResponse<Asset>>(`/asset/${id}`);
}

export function postAssetTransferApi(data: PostAssetTransferApiData) {
  return request.post<unknown, SuccessResponse<AssetTransfer>>('/asset/transfers', data);
}

export function postVoidAssetTransferApi(id: string, version: number) {
  return request.post<unknown, SuccessResponse<AssetTransfer>>(`/asset/transfers/${id}/void`, { version });
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
