import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetChartApiParams, GetChartApiResponse, GetChartApiResponseMonthData, GetChartApiResponseWeekData, GetChartApiResponseYearData } from '@/api';
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

export function isWeekData(data: GetChartApiResponse): data is GetChartApiResponseWeekData[] {
  if (!data.length)
    return false;
  if (!data[0].data?.length)
    return false;

  return data[0].type === 'year' && data[0].data[0].type === 'week';
}

export function isMonthData(data: GetChartApiResponse): data is GetChartApiResponseMonthData[] {
  if (!data.length)
    return false;
  if (!data[0].data?.length)
    return false;

  return data[0].type === 'year' && data[0].data[0].type === 'month' && ('ranking' in data[0].data[0]);
}

export function isYearData(data: GetChartApiResponse): data is GetChartApiResponseYearData[] {
  if (!data.length)
    return false;
  if (!data[0].data?.length)
    return false;

  return data[0].type === 'year' && ('ranking' in data[0]) && data[0].data[0].type === 'month';
}
