import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  DeleteBudgetCategoryByBudgetIdApiData,
  GetBudgetInfoApiParams,
  GetBudgetInfoApiResponseData,
  GetLedgerBudgetInfoApiParams,
  PatchBudgetAmountByBudgetIdApiData,
} from './api';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import {
  deleteBudgetCategoryByBudgetIdApi,
  deleteLedgerBudgetCategoryApi,
  getBudgetInfoApi,
  getLedgerBudgetInfoApi,
  patchBudgetAmountByBudgetIdApi,
  patchLedgerBudgetAmountApi,
  postBudgetCategoryApi,
  postBudgetClearApi,
  postBudgetSummaryApi,
  postLedgerBudgetCategoryApi,
  postLedgerBudgetClearApi,
  postLedgerBudgetSummaryApi,
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

export function useLedgerBudgetInfoQuery(options: {
  params: { ledgerId: string; filters: GetLedgerBudgetInfoApiParams };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetBudgetInfoApiResponseData>>, 'queryFn' | 'queryKey'>;
}) {
  const { ledgerId, filters } = options.params;
  const { data: response, ...rest } = useQuery<SuccessResponse<GetBudgetInfoApiResponseData>>({
    queryFn: async () => assertSuccessApi(await getLedgerBudgetInfoApi(ledgerId, filters)),
    queryKey: budgetKeys.ledgerInfo(ledgerId, filters),
    ...options.queryOptions,
  });
  return {
    response,
    data: isSuccessApi(response) ? response.data : emptyBudgetInfo,
    ...rest,
  };
}

function useLedgerBudgetMutation<TVariables extends { ledgerId: string }>(
  mutationFn: (variables: TVariables) => Promise<SuccessResponse<unknown>>,
) {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn,
    onSuccess: async (_response, variables) => queryClient.invalidateQueries({
      queryKey: budgetKeys.ledgerInfoRoot(variables.ledgerId),
    }),
  });
  return [mutateAsync, rest] as const;
}

function acceptLedgerBudgetWarning(response: SuccessResponse<unknown>) {
  return response.statusCode === 4017 ? response : assertSuccessApi(response);
}

export function useCreateLedgerBudgetSummaryMutation() {
  return useLedgerBudgetMutation((options: {
    ledgerId: string;
    data: Parameters<typeof postLedgerBudgetSummaryApi>[1];
  }) => postLedgerBudgetSummaryApi(options.ledgerId, options.data).then(acceptLedgerBudgetWarning));
}

export function useCreateLedgerBudgetCategoryMutation() {
  return useLedgerBudgetMutation((options: {
    ledgerId: string;
    data: Parameters<typeof postLedgerBudgetCategoryApi>[1];
  }) => postLedgerBudgetCategoryApi(options.ledgerId, options.data).then(acceptLedgerBudgetWarning));
}

export function useClearLedgerBudgetMutation() {
  return useLedgerBudgetMutation((options: {
    ledgerId: string;
    data: Parameters<typeof postLedgerBudgetClearApi>[1];
  }) => postLedgerBudgetClearApi(options.ledgerId, options.data).then(assertSuccessApi));
}

export function useDeleteLedgerBudgetCategoryMutation() {
  return useLedgerBudgetMutation((options: {
    ledgerId: string;
    budgetId: string;
    data: Parameters<typeof deleteLedgerBudgetCategoryApi>[2];
  }) => deleteLedgerBudgetCategoryApi(options.ledgerId, options.budgetId, options.data).then(assertSuccessApi));
}

export function usePatchLedgerBudgetAmountMutation() {
  return useLedgerBudgetMutation((options: {
    ledgerId: string;
    budgetId: string;
    data: Parameters<typeof patchLedgerBudgetAmountApi>[2];
  }) => patchLedgerBudgetAmountApi(options.ledgerId, options.budgetId, options.data).then(acceptLedgerBudgetWarning));
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
