import type { GetAssetRecordApiParams, GetAssetStatisticalRecordApiParams } from './api';

export const assetKeys = {
  all: ['asset'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: () => [...assetKeys.lists()] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
  groups: () => [...assetKeys.all, 'group'] as const,
  group: (id: string) => [...assetKeys.groups(), id] as const,
  records: () => [...assetKeys.all, 'record'] as const,
  record: (params: GetAssetRecordApiParams) => [...assetKeys.records(), params] as const,
  statisticalRecords: () => [...assetKeys.all, 'statistical-record'] as const,
  statisticalRecord: (params: GetAssetStatisticalRecordApiParams) =>
    [...assetKeys.statisticalRecords(), params] as const,
};
