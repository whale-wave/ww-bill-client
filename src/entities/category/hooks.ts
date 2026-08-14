import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  CategoryIconCatalogItem,
  GetCategoryApiParams,
  GetCategoryApiResponseData,
} from './api';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import {
  deleteLedgerCategoryApi,
  getCategoryApi,
  getCategoryIconCatalogApi,
  getLedgerCategoriesApi,
  patchLedgerCategoryApi,
  postLedgerCategoryApi,
  putLedgerCategoryApi,
  reorderLedgerCategoriesApi,
  uploadLedgerCategoryIconApi,
} from './api';
import { invalidateCategoryConsumers } from './cache';
import { categoryKeys } from './keys';

export function useGetCategoryQuery(options?: {
  params?: GetCategoryApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetCategoryApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetCategoryApiResponseData>>({
    queryFn: () => getCategoryApi(options?.params),
    queryKey: categoryKeys.list(options?.params),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function useLedgerCategoriesQuery(options: {
  params: {
    ledgerId: string;
    status?: GetCategoryApiParams['status'];
    type?: GetCategoryApiParams['type'];
  };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetCategoryApiResponseData>>, 'queryFn' | 'queryKey'>;
}) {
  const filters = {
    ...(options.params.type ? { type: options.params.type } : {}),
    ...(options.params.status ? { status: options.params.status } : {}),
  };
  const { data: response, ...rest } = useQuery<SuccessResponse<GetCategoryApiResponseData>>({
    queryFn: async () => assertSuccessApi(await getLedgerCategoriesApi(options.params.ledgerId, filters)),
    queryKey: categoryKeys.ledgerList(options.params.ledgerId, filters),
    ...options.queryOptions,
  });
  return {
    response,
    data: isSuccessApi(response) ? response.data.data : [],
    ...rest,
  };
}

export function useCategoryIconCatalogQuery() {
  const { data: response, ...rest } = useQuery<SuccessResponse<CategoryIconCatalogItem[]>>({
    queryFn: async () => assertSuccessApi(await getCategoryIconCatalogApi()),
    queryKey: categoryKeys.catalog(),
    staleTime: Number.POSITIVE_INFINITY,
  });
  return {
    response,
    data: isSuccessApi(response) ? response.data : [],
    ...rest,
  };
}

export function useCreateLedgerCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: {
      data: Parameters<typeof postLedgerCategoryApi>[1];
      ledgerId: string;
      onProgress?: (progress: number) => void;
    }) => postLedgerCategoryApi(
      options.ledgerId,
      options.data,
      options.onProgress,
    ).then(assertSuccessApi),
    onSuccess: async () => invalidateCategoryConsumers(queryClient, 'status'),
  });
  return [mutateAsync, rest] as const;
}

export function useUpdateLedgerCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { ledgerId: string; categoryId: number; data: Parameters<typeof putLedgerCategoryApi>[2] }) =>
      putLedgerCategoryApi(options.ledgerId, options.categoryId, options.data).then(assertSuccessApi),
    onSuccess: async () => invalidateCategoryConsumers(queryClient, 'metadata'),
  });
  return [mutateAsync, rest] as const;
}

export function usePatchLedgerCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: async (options: {
      categoryId: number;
      data: Parameters<typeof patchLedgerCategoryApi>[2];
      ledgerId: string;
    }) => {
      const response = assertSuccessApi(await patchLedgerCategoryApi(
        options.ledgerId,
        options.categoryId,
        options.data,
      ));
      return response.data;
    },
    onSuccess: async (_response, variables) => invalidateCategoryConsumers(
      queryClient,
      variables.data.status !== undefined
      && variables.data.name === undefined
      && variables.data.iconKey === undefined
        ? 'status'
        : 'metadata',
    ),
  });
  return [mutateAsync, rest] as const;
}

export function useReorderLedgerCategoriesMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: async (options: {
      data: Parameters<typeof reorderLedgerCategoriesApi>[1];
      ledgerId: string;
    }) => {
      const response = assertSuccessApi(await reorderLedgerCategoriesApi(
        options.ledgerId,
        options.data,
      ));
      return response.data;
    },
    onSuccess: async () => invalidateCategoryConsumers(queryClient, 'order'),
  });
  return [mutateAsync, rest] as const;
}

export function useUploadLedgerCategoryIconMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: async (options: {
      categoryId: number;
      file: File;
      ledgerId: string;
      onProgress?: (progress: number) => void;
      version: number;
    }) => {
      const response = assertSuccessApi(await uploadLedgerCategoryIconApi(
        options.ledgerId,
        options.categoryId,
        options.file,
        options.version,
        options.onProgress,
      ));
      return response.data;
    },
    onSuccess: async () => invalidateCategoryConsumers(queryClient, 'metadata'),
  });
  return [mutateAsync, rest] as const;
}

export function useDeleteLedgerCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { ledgerId: string; categoryId: number; version?: number }) =>
      deleteLedgerCategoryApi(options.ledgerId, options.categoryId, options.version)
        .then(assertSuccessApi),
    onSuccess: async () => invalidateCategoryConsumers(queryClient, 'status'),
  });
  return [mutateAsync, rest] as const;
}
