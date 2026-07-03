import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  FixedExpenseEntity,
  FixedExpenseSummary,
  GetFixedExpenseByIdApiParams,
  GetFixedExpenseListResponseData,
  GetFixedExpenseQuery,
  UpdateFixedExpenseApiData,
} from './api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/shared/api';
import { deleteFixedExpenseApi, getFixedExpenseApi, getFixedExpenseByIdApi, patchFixedExpenseApi, postFixedExpenseApi } from './api';
import { fixedExpenseKeys } from './keys';

const emptySummary: FixedExpenseSummary = {
  monthlyTotal: '0',
  yearlyTotal: '0',
  activeMonthlyTotal: '0',
  nextBillingItems: [],
};

interface UseGetFixedExpenseQueryOptions {
  params?: GetFixedExpenseQuery;
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<GetFixedExpenseListResponseData>,
      unknown,
      SuccessResponse<GetFixedExpenseListResponseData>,
      ReturnType<typeof fixedExpenseKeys.list>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useGetFixedExpenseQuery(options: UseGetFixedExpenseQueryOptions = {}) {
  const queryKey = fixedExpenseKeys.list(options.params);
  const { data: response, ...rest } = useQuery({
    queryFn: () => getFixedExpenseApi(options.params),
    queryKey,
    ...options.queryOptions,
  });

  const list = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data.list;
  }, [response]);

  const summary = useMemo(() => {
    if (!isSuccessApi(response))
      return emptySummary;
    return response.data.summary;
  }, [response]);

  return {
    response,
    list,
    summary,
    ...rest,
  };
}

interface UseGetFixedExpenseByIdQueryOptions {
  params: GetFixedExpenseByIdApiParams;
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<FixedExpenseEntity>,
      unknown,
      SuccessResponse<FixedExpenseEntity>,
      ReturnType<typeof fixedExpenseKeys.detail>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useGetFixedExpenseByIdQuery(options: UseGetFixedExpenseByIdQueryOptions) {
  const queryKey = fixedExpenseKeys.detail(options.params.id);
  const { data: response, ...rest } = useQuery({
    queryFn: () => getFixedExpenseByIdApi(options.params),
    queryKey,
    ...options.queryOptions,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function usePostFixedExpenseMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postFixedExpenseApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.details() }),
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

export function usePatchFixedExpenseMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: { id: string; params: UpdateFixedExpenseApiData }) =>
      patchFixedExpenseApi(params.id, params.params),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.detail(variables.id) }),
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

export function useDeleteFixedExpenseMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteFixedExpenseApi,
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.detail(id) }),
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
