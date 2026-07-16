import type { UseQueryOptions } from '@tanstack/react-query';
import type { SystemNotify } from './api';
import type { SuccessResponse } from '@/shared/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/shared/api';
import { getSystemNotifyApi } from './api';
import { systemKeys } from './keys';

export function useGetSystemNotifyQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<SystemNotify[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<SystemNotify[]>>({
    queryFn: () => getSystemNotifyApi(),
    queryKey: systemKeys.notify(),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
