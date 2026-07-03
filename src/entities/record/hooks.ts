import type { UseQueryOptions } from '@tanstack/react-query';
import type { ToastHandler } from 'antd-mobile/es/components/toast';
import type {
  GetRecordApiParams,
  GetRecordApiResponseData,
  GetRecordBillApiParams,
  GetRecordBillApiResponseData,
  RecordEntry,
} from './api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import { useEffect, useMemo, useRef } from 'react';
// transitional: chartKeys still in old hooks layer until chart entity extracted
import { chartKeys } from '@/hooks/query';
import { isSuccessApi } from '@/shared/api';
import { deleteRecordApi, getRecordApi, getRecordBillApi, getRecordByIdApi, postRecordApi, putRecordApi } from './api';
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
};

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

  const loadingToastHandle = useRef<ToastHandler | null>(null);

  useEffect(() => {
    if (!isNotDataLoading && !loadingToastHandle.current)
      return;

    if (loadingToastHandle.current) {
      loadingToastHandle.current.close();
      loadingToastHandle.current = null;
      return;
    }
    loadingToastHandle.current = Toast.show({
      content: '数据加载中',
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
    mutationFn: postRecordApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: recordKeys.bills() }),
        queryClient.invalidateQueries({ queryKey: chartKeys.all }),
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

export function usePutRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: Parameters<typeof putRecordApi>[1];
    }) => putRecordApi(params.id, params.data),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: recordKeys.detail({ id: variables.id }) }),
        queryClient.invalidateQueries({ queryKey: recordKeys.bills() }),
        queryClient.invalidateQueries({ queryKey: chartKeys.all }),
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

export function useDeleteRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteRecordApi,
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: recordKeys.detail({ id }) }),
        queryClient.invalidateQueries({ queryKey: recordKeys.bills() }),
        queryClient.invalidateQueries({ queryKey: chartKeys.all }),
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
