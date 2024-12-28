import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetChartApiParams } from '@/api';
import { getChartApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetChartQueryQueryKey = 'useGetChartQuery';

export function useGetChartQuery(options: {
  params: GetChartApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getChartApi(options.params),
    queryKey: [useGetChartQueryQueryKey, options.params] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    data,
    response,
    ...rest,
  };
}
