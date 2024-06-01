import { useQuery } from '@tanstack/react-query';
import { getSystemNotifyApi } from '@/api';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';

export const useGetSystemNotifyQuery = (options?: {
  params?: any;
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getSystemNotifyApi(),
    queryKey: ['useGetSystemNotifyQuery', options?.params] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response)) return [];
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
};
