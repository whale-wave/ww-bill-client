import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  Asset,
  AssetGroup,
  AssetRecord,
  AssetStatisticalRecord,
  GetAssetRecordApiParams,
  GetAssetStatisticalRecordApiParams,
  PatchAssetAdjustApiData,
} from './api';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import {
  deleteAssetByIdApi,
  getAssetApi,
  getAssetByIdApi,
  getAssetGroupApi,
  getAssetGroupByIdApi,
  getAssetRecordApi,
  getAssetStatisticalRecordApi,
  patchAssetAdjustApi,
  postAssetApi,
} from './api';
import { assetKeys } from './keys';

export function useGetAssetQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<Asset[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<Asset[]>>({
    queryFn: async () => assertSuccessApi(await getAssetApi()),
    queryKey: assetKeys.list(),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function useGetAssetByIdQuery(options: {
  params: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<Asset>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<Asset>>({
    queryFn: async () => assertSuccessApi(await getAssetByIdApi(options.params)),
    queryKey: assetKeys.detail(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    data,
    response,
    ...rest,
  };
}

export function useGetAssetGroupQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetGroup[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetGroup[]>>({
    queryFn: async () => assertSuccessApi(await getAssetGroupApi()),
    queryKey: assetKeys.groups(),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function useGetAssetGroupById(options: {
  params: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetGroup>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetGroup>>({
    queryFn: async () => assertSuccessApi(await getAssetGroupByIdApi(options.params)),
    queryKey: assetKeys.group(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    data,
    response,
    ...rest,
  };
}

export function useGetAssetRecordQuery(options: {
  params: GetAssetRecordApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetRecord[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetRecord[]>>({
    queryFn: async () => assertSuccessApi(await getAssetRecordApi(options.params)),
    queryKey: assetKeys.record(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    data,
    response,
    ...rest,
  };
}

export function useGetAssetStatisticalRecordQuery(options: {
  params: GetAssetStatisticalRecordApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetStatisticalRecord[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetStatisticalRecord[]>>({
    queryFn: async () => assertSuccessApi(await getAssetStatisticalRecordApi(options.params)),
    queryKey: assetKeys.statisticalRecord(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    data,
    response,
    ...rest,
  };
}

export function usePostAssetMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (data: Parameters<typeof postAssetApi>[0]) => postAssetApi(data).then(assertSuccessApi),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.details() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.records() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.statisticalRecords() }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePatchAssetAdjustMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: PatchAssetAdjustApiData;
    }) => patchAssetAdjustApi(params.id, params.data).then(assertSuccessApi),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: assetKeys.records() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.statisticalRecords() }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function useDeleteAssetByIdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: string) => deleteAssetByIdApi(params).then(assertSuccessApi),
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: assetKeys.records() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.statisticalRecords() }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
