import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';
import { getChartApi, GetChartParams } from '@/api';

export const useGetChartQueryKey = 'useGetChartQuery' as const;

export const useGetChartQuery = (options?: {
  params: GetChartParams;
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getChartApi(queryKey[1]),
    queryKey: [useGetChartQueryKey, options!.params] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response)) return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
};
