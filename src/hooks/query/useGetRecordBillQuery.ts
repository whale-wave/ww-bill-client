import type { UseQueryOptions } from '@tanstack/react-query';
import type { ToastHandler } from 'antd-mobile/es/components/toast';
import type { GetRecordBillApiParams, GetRecordBillApiResponseData } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import { useEffect, useMemo, useRef } from 'react';
import { getRecordBillApi } from '@/api';
import { recordKeys } from '@/hooks/query/keys/recordKeys';
import { isSuccessApi } from '@/shared/api';

const emptyBill: GetRecordBillApiResponseData = {
  list: {},
  all: {
    income: 0,
    expand: 0,
    balance: 0,
  },
};

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
