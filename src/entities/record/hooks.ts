import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { ToastHandler } from 'antd-mobile/es/components/toast';
import type {
  GetRecordApiParams,
  GetRecordApiResponseData,
  GetRecordBillApiParams,
  GetRecordBillApiResponseData,
  MonthBillDetailResponse,
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
  getHouseholdMonthBillDetailApi,
  getHouseholdRecordBillApi,
  getLedgerMonthBillDetailApi,
  getLedgerRecordBillApi,
  getLedgerRecordByIdApi,
  getLedgerRecordRemarkHistoryApi,
  getLedgerRecordsApi,
  getMonthBillDetailApi,
  getRecordApi,
  getRecordAttachmentContentApi,
  getRecordBillApi,
  getRecordByIdApi,
  getRecordFilterOptionsApi,
  getRecordRemarkHistoryApi,
  postLedgerRecordApi,
  postRecordApi,
  postTemporaryRecordAttachmentApi,
  putLedgerRecordApi,
  putRecordApi,
} from './api';
import { recordKeys } from './keys';
import { normalizeMonthBillDetail } from './month-bill-detail';

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

export function useUploadTemporaryRecordAttachmentMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { file: File; ledgerId?: string }) =>
      postTemporaryRecordAttachmentApi(options.file, options.ledgerId),
  });
  return [mutateAsync, rest] as const;
}

/**
 * Authenticated attachments stay in the in-memory query cache for this login
 * session. Blob data must never be included in the persisted query cache.
 */
export function useRecordAttachmentContentQuery(options: {
  attachmentId?: string;
  householdId?: string;
  variant: 'content' | 'thumbnail';
  enabled?: boolean;
}) {
  const { attachmentId, enabled = true, householdId, variant } = options;
  return useQuery<Blob>({
    enabled: Boolean(attachmentId) && enabled,
    meta: { persist: false },
    queryFn: () => getRecordAttachmentContentApi(attachmentId!, variant, householdId),
    queryKey: recordKeys.attachmentContent(attachmentId ?? '', variant, householdId),
  });
}

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
    keepPreviousData: true,
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
    keepPreviousData: true,
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

export function useRecordRemarkHistoryQuery(options: {
  params: { categoryId?: number; ledgerId?: string };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<string[]>>, 'queryFn' | 'queryKey'>;
}) {
  const { categoryId, ledgerId } = options.params;
  const enabled = Boolean(categoryId);
  const { data: response, ...rest } = useQuery<SuccessResponse<string[]>>({
    enabled,
    queryFn: () => ledgerId
      ? getLedgerRecordRemarkHistoryApi(ledgerId, { categoryId: categoryId! })
      : getRecordRemarkHistoryApi({ categoryId: categoryId! }),
    queryKey: ledgerId
      ? recordKeys.ledgerRemarkHistory(ledgerId, categoryId ?? 0)
      : recordKeys.remarkHistory(categoryId ?? 0),
    ...options.queryOptions,
  });
  return { response, data: response?.data ?? [], ...rest };
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
    keepPreviousData: true,
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
    keepPreviousData: true,
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
    keepPreviousData: true,
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

export function useMonthBillDetailQuery(options: {
  month: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<MonthBillDetailResponse>>, 'queryFn' | 'queryKey'>;
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<MonthBillDetailResponse>>({
    queryFn: async () => {
      const response = assertSuccessApi(await getMonthBillDetailApi(options.month));
      return { ...response, data: normalizeMonthBillDetail(response.data) };
    },
    queryKey: recordKeys.billMonthDetail(options.month),
    keepPreviousData: true,
    ...options.queryOptions,
  });

  return {
    response,
    data: response?.data,
    ...rest,
  };
}

export function useLedgerMonthBillDetailQuery(options: {
  ledgerId: string;
  month: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<MonthBillDetailResponse>>, 'queryFn' | 'queryKey'>;
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<MonthBillDetailResponse>>({
    queryFn: async () => {
      const response = assertSuccessApi(await getLedgerMonthBillDetailApi(options.ledgerId, options.month));
      return { ...response, data: normalizeMonthBillDetail(response.data) };
    },
    queryKey: recordKeys.ledgerMonthBillDetail(options.ledgerId, options.month),
    keepPreviousData: true,
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useHouseholdMonthBillDetailQuery(options: {
  householdId: string;
  month: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<MonthBillDetailResponse>>, 'queryFn' | 'queryKey'>;
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<MonthBillDetailResponse>>({
    queryFn: async () => {
      const response = assertSuccessApi(await getHouseholdMonthBillDetailApi(options.householdId, options.month));
      return { ...response, data: normalizeMonthBillDetail(response.data) };
    },
    queryKey: recordKeys.householdMonthBillDetail(options.householdId, options.month),
    keepPreviousData: true,
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
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
    onSuccess: (_response, variables) => {
      invalidatePersonalDeleteSuccessCaches(queryClient, variables.id);
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await invalidatePersonalDeleteConflictCaches(queryClient, variables.id);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

function invalidatePersonalDeleteSuccessCaches(
  queryClient: QueryClient,
  recordId: string,
) {
  queryClient.removeQueries({ queryKey: recordKeys.detail({ id: recordId }) });
  void invalidatePersonalRecordCaches(queryClient);
}

async function invalidatePersonalDeleteConflictCaches(
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
    queryClient.invalidateQueries({ queryKey: recordKeys.remarkHistories() }),
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
