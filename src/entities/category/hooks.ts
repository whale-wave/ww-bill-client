import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetCategoryApiParams, GetCategoryApiResponseData } from './api';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import {
  deleteLedgerCategoryApi,
  getCategoryApi,
  getLedgerCategoriesApi,
  postLedgerCategoryApi,
  putLedgerCategoryApi,
} from './api';
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
  params: { ledgerId: string; type?: GetCategoryApiParams['type'] };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetCategoryApiResponseData>>, 'queryFn' | 'queryKey'>;
}) {
  const filters = options.params.type ? { type: options.params.type } : undefined;
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

export function useCreateLedgerCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { ledgerId: string; data: Parameters<typeof postLedgerCategoryApi>[1] }) =>
      postLedgerCategoryApi(options.ledgerId, options.data).then(assertSuccessApi),
    onSuccess: async (_response, variables) => queryClient.invalidateQueries({
      queryKey: categoryKeys.ledgerListRoot(variables.ledgerId),
    }),
  });
  return [mutateAsync, rest] as const;
}

export function useUpdateLedgerCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { ledgerId: string; categoryId: number; data: Parameters<typeof putLedgerCategoryApi>[2] }) =>
      putLedgerCategoryApi(options.ledgerId, options.categoryId, options.data).then(assertSuccessApi),
    onSuccess: async (_response, variables) => queryClient.invalidateQueries({
      queryKey: categoryKeys.ledgerListRoot(variables.ledgerId),
    }),
  });
  return [mutateAsync, rest] as const;
}

export function useDeleteLedgerCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { ledgerId: string; categoryId: number }) =>
      deleteLedgerCategoryApi(options.ledgerId, options.categoryId).then(assertSuccessApi),
    onSuccess: async (_response, variables) => queryClient.invalidateQueries({
      queryKey: categoryKeys.ledgerListRoot(variables.ledgerId),
    }),
  });
  return [mutateAsync, rest] as const;
}
