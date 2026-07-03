import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetChartApiParams, GetChartApiResponse, GetChartApiResponseMonthData, GetChartApiResponseWeekData, GetChartApiResponseYearData } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getChartApi } from '@/api';
import { chartKeys } from '@/hooks/query/keys/chartKeys';
import { isSuccessApi } from '@/shared/api';

export function useGetChartQuery(options: {
  params: GetChartApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetChartApiResponse>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetChartApiResponse>>({
    queryFn: () => getChartApi(options.params),
    queryKey: chartKeys.list(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
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
