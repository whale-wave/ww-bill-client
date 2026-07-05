import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  DeleteBudgetCategoryByBudgetIdApiData,
  GetBudgetInfoApiParams,
  GetBudgetInfoApiResponseData,
  PatchBudgetAmountByBudgetIdApiData,
} from './api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi, type SuccessResponse } from '@/shared/api';
import {
  deleteBudgetCategoryByBudgetIdApi,
  getBudgetInfoApi,
  patchBudgetAmountByBudgetIdApi,
  postBudgetCategoryApi,
  postBudgetClearApi,
  postBudgetSummaryApi,
} from './api';
import { budgetKeys } from './keys';

const emptyBudgetInfo: GetBudgetInfoApiResponseData = {
  categoryBudgets: [],
};

export function useGetBudgetInfoQuery(options: {
  params: GetBudgetInfoApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetBudgetInfoApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetBudgetInfoApiResponseData>>({
    queryFn: () => getBudgetInfoApi(options.params),
    queryKey: budgetKeys.info(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return emptyBudgetInfo;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function usePostBudgetSummaryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetSummaryApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.infoRoot() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePostBudgetCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetCategoryApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.infoRoot() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePostBudgetClearMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetClearApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.infoRoot() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function useDeleteBudgetCategoryByBudgetIdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ budgetId, data }: {
      budgetId: string | number;
      data: DeleteBudgetCategoryByBudgetIdApiData;
    }) => deleteBudgetCategoryByBudgetIdApi(budgetId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.infoRoot() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePatchBudgetAmountByBudgetIdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ budgetId, data }: {
      budgetId: string | number;
      data: PatchBudgetAmountByBudgetIdApiData;
    }) => patchBudgetAmountByBudgetIdApi(budgetId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.infoRoot() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
