import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { ToastHandler } from 'antd-mobile/es/components/toast';
import type {
  GetRecordApiParams,
  GetRecordApiResponseData,
  GetRecordBillApiParams,
  GetRecordBillApiResponseData,
  RecordFilterOptionsData,
} from './api';
import type { RecordEntry } from './types';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import { useEffect, useMemo, useRef } from 'react';
import { chartKeys } from '@/entities/chart';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import { i18n } from '@/shared/i18n';
import {
  deleteLedgerRecordApi,
  deleteRecordApi,
  getHouseholdRecordBillApi,
  getLedgerRecordBillApi,
  getLedgerRecordByIdApi,
  getLedgerRecordsApi,
  getRecordApi,
  getRecordBillApi,
  getRecordByIdApi,
  getRecordFilterOptionsApi,
  postLedgerRecordApi,
  postRecordApi,
  putLedgerRecordApi,
  putRecordApi,
} from './api';
import { recordKeys } from './keys';

const emptyRecordInfo: GetRecordApiResponseData = {
  total: 0,
  data: [],
  expend: 0,
  income: 0,
};

const emptyBill: GetRecordBillApiResponseData = {
  list: {},
  all: {
    income: 0,
    expand: 0,
    balance: 0,
  },
  earliestMonth: null,
};

const emptyRecordFilterOptions: RecordFilterOptionsData = {
  capabilities: { category: false, tag: false },
  categories: [],
  tags: [],
};

const ledgerNavigationKey = ['ledger', 'navigation'] as const;

export function invalidateRecordCountNavigationCache(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ledgerNavigationKey });
}

async function invalidateLedgerRecordSuccessCaches(
  queryClient: QueryClient,
  ledgerId: string,
  invalidatesRecordCount: boolean,
) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: recordKeys.ledgerRoot(ledgerId) }),
    queryClient.invalidateQueries({ queryKey: chartKeys.ledgerRoot(ledgerId) }),
  ];
  if (invalidatesRecordCount)
    invalidations.push(invalidateRecordCountNavigationCache(queryClient));
  await Promise.all(invalidations);
}

export function useGetRecordQuery(options: {
  params?: GetRecordApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetRecordApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
} = {}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetRecordApiResponseData>>({
    queryFn: () => getRecordApi(options.params),
    queryKey: recordKeys.list(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return emptyRecordInfo;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}

export function useLedgerRecordsQuery(options: {
  params: { ledgerId: string; filters?: GetRecordApiParams };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetRecordApiResponseData>>, 'queryFn' | 'queryKey'>;
}) {
  const { ledgerId, filters } = options.params;
  const { data: response, ...rest } = useQuery<SuccessResponse<GetRecordApiResponseData>>({
    queryFn: async () => assertSuccessApi(await getLedgerRecordsApi(ledgerId, filters)),
    queryKey: recordKeys.ledgerList(ledgerId, filters),
    ...options.queryOptions,
  });
  return {
    response,
    data: isSuccessApi(response) ? response.data : emptyRecordInfo,
    ...rest,
  };
}

export function useRecordFilterOptionsQuery(options: {
  params?: { ledgerId?: string };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<RecordFilterOptionsData>>, 'queryFn' | 'queryKey'>;
} = {}) {
  const ledgerId = options.params?.ledgerId;
  const { data: response, ...rest } = useQuery<SuccessResponse<RecordFilterOptionsData>>({
    queryFn: async () => assertSuccessApi(await getRecordFilterOptionsApi(ledgerId)),
    queryKey: ledgerId
      ? recordKeys.ledgerFilterOptions(ledgerId)
      : recordKeys.filterOptions(),
    ...options.queryOptions,
  });
  return {
    response,
    data: response?.data ?? emptyRecordFilterOptions,
    ...rest,
  };
}

export function useLedgerRecordQuery(options: {
  params: { ledgerId: string; recordId: string };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<RecordEntry>>, 'queryFn' | 'queryKey'>;
}) {
  const { ledgerId, recordId } = options.params;
  const { data: response, ...rest } = useQuery<SuccessResponse<RecordEntry>>({
    queryFn: async () => assertSuccessApi(await getLedgerRecordByIdApi(ledgerId, recordId)),
    queryKey: recordKeys.ledgerDetail(ledgerId, recordId),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useLedgerRecordBillQuery(options: {
  params: { ledgerId: string; filters: GetRecordBillApiParams };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetRecordBillApiResponseData>>, 'queryFn' | 'queryKey'>;
}) {
  const { ledgerId, filters } = options.params;
  const { data: response, ...rest } = useQuery<SuccessResponse<GetRecordBillApiResponseData>>({
    queryFn: async () => assertSuccessApi(await getLedgerRecordBillApi(ledgerId, filters)),
    queryKey: recordKeys.ledgerBill(ledgerId, filters),
    ...options.queryOptions,
  });
  return { response, data: response?.data ?? emptyBill, ...rest };
}

export function useHouseholdRecordBillQuery(options: {
  params: { householdId: string; filters: GetRecordBillApiParams };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetRecordBillApiResponseData>>, 'queryFn' | 'queryKey'>;
}) {
  const { householdId, filters } = options.params;
  const { data: response, ...rest } = useQuery<SuccessResponse<GetRecordBillApiResponseData>>({
    queryFn: async () =>
      assertSuccessApi(await getHouseholdRecordBillApi(householdId, filters)),
    queryKey: recordKeys.householdBill(householdId, filters),
    ...options.queryOptions,
  });
  return { response, data: response?.data ?? emptyBill, ...rest };
}

function useLedgerRecordMutation<TVariables extends { ledgerId: string }>(
  mutationFn: (variables: TVariables) => Promise<SuccessResponse<unknown>>,
  options: {
    invalidatesRecordCountOnConflict?: boolean;
    invalidatesRecordCountOnSuccess?: boolean;
  } = {},
) {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn,
    onSuccess: async (_response, variables) => {
      await invalidateLedgerRecordSuccessCaches(
        queryClient,
        variables.ledgerId,
        options.invalidatesRecordCountOnSuccess ?? false,
      );
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409) {
        if (options.invalidatesRecordCountOnConflict) {
          await invalidateLedgerRecordSuccessCaches(
            queryClient,
            variables.ledgerId,
            true,
          );
          return;
        }
        await queryClient.invalidateQueries({ queryKey: recordKeys.ledgerRoot(variables.ledgerId) });
      }
    },
  });
  return [mutateAsync, rest] as const;
}

export function useCreateLedgerRecordMutation() {
  return useLedgerRecordMutation((options: {
    ledgerId: string;
    data: Parameters<typeof postLedgerRecordApi>[1];
  }) => postLedgerRecordApi(options.ledgerId, options.data).then(assertSuccessApi), {
    invalidatesRecordCountOnConflict: true,
    invalidatesRecordCountOnSuccess: true,
  });
}

export function useUpdateLedgerRecordMutation() {
  return useLedgerRecordMutation((options: {
    ledgerId: string;
    recordId: string;
    data: Parameters<typeof putLedgerRecordApi>[2];
  }) => putLedgerRecordApi(options.ledgerId, options.recordId, options.data).then(assertSuccessApi), {
    invalidatesRecordCountOnSuccess: true,
  });
}

export function useDeleteLedgerRecordMutation() {
  return useLedgerRecordMutation((options: { ledgerId: string; recordId: string; version: number }) =>
    deleteLedgerRecordApi(options.ledgerId, options.recordId, options.version).then(assertSuccessApi), {
    invalidatesRecordCountOnConflict: true,
    invalidatesRecordCountOnSuccess: true,
  });
}

export function useGetRecordByIdQuery(options?: {
  params: { id: string };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<RecordEntry>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<RecordEntry>>({
    queryFn: () => getRecordByIdApi(options!.params),
    queryKey: recordKeys.detail(options!.params),
    ...options?.queryOptions,
    ...options?.options,
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

export function useGetRecordBillQuery(options?: {
  params: GetRecordBillApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetRecordBillApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, isLoading, ...rest } = useQuery<SuccessResponse<GetRecordBillApiResponseData>>({
    queryFn: () => getRecordBillApi(options!.params),
    queryKey: recordKeys.bill(options!.params),
    ...options?.queryOptions,
    ...options?.options,
  });

  const isNotDataLoading = useMemo(() => !response && isLoading, [response, isLoading]);

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return emptyBill;
    return response.data;
  }, [response]);

  const loadingToastHandleRef = useRef<ToastHandler | null>(null);

  useEffect(() => {
    if (!isNotDataLoading && !loadingToastHandleRef.current)
      return;

    if (loadingToastHandleRef.current) {
      loadingToastHandleRef.current.close();
      loadingToastHandleRef.current = null;
      return;
    }
    loadingToastHandleRef.current = Toast.show({
      content: i18n.t('common:api.loading'),
      duration: 0,
      position: 'top',
    });
  }, [isNotDataLoading]);

  return {
    response,
    data,
    isNotDataLoading,
    isLoading,
    ...rest,
  };
}

export function usePostRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (data: Parameters<typeof postRecordApi>[0]) =>
      postRecordApi(data).then(assertSuccessApi),
    onSuccess: async () => invalidatePersonalRecordCaches(queryClient),
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePutRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: Parameters<typeof putRecordApi>[1];
    }) => putRecordApi(params.id, params.data).then(assertSuccessApi),
    onSuccess: async (_response, variables) =>
      invalidatePersonalRecordCaches(queryClient, variables.id),
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function useDeleteRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: { id: string; version: number }) =>
      deleteRecordApi(params.id, params.version).then(assertSuccessApi),
    onSuccess: async (_response, variables) => {
      await invalidatePersonalDeleteRecordCaches(queryClient, variables.id);
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await invalidatePersonalDeleteRecordCaches(queryClient, variables.id);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

async function invalidatePersonalDeleteRecordCaches(
  queryClient: QueryClient,
  recordId: string,
) {
  await invalidatePersonalRecordCaches(queryClient, recordId);
}

async function invalidatePersonalRecordCaches(
  queryClient: QueryClient,
  recordId?: string,
) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: recordKeys.bills() }),
    queryClient.invalidateQueries({ queryKey: chartKeys.all }),
    invalidateRecordCountNavigationCache(queryClient),
  ];
  if (recordId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: recordKeys.detail({ id: recordId }) }),
    );
  }
  await Promise.all([
    ...invalidations,
  ]);
}
