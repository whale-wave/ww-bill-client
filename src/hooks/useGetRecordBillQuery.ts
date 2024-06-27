import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import type { ToastHandler } from 'antd-mobile/es/components/toast';
import { Toast } from 'antd-mobile';
import type { GetRecordBillApiParams } from '@/api';
import { getRecordBillApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetRecordBillQueryQueryKey = 'useGetRecordBillQuery';

export function useGetRecordBillQuery(options?: {
  params: GetRecordBillApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, isLoading, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getRecordBillApi(queryKey[1]),
    queryKey: [useGetRecordBillQueryQueryKey, options!.params] as const,
    ...options?.options,
  });

  const isNotDataLoading = useMemo(() => !response && isLoading, [response, isLoading]);

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
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
