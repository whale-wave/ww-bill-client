import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  GetChartApiParams,
  GetChartApiResponse,
  GetChartApiResponseMonthData,
  GetChartApiResponseWeekData,
  GetChartApiResponseYearData,
  GetTagRankingParams,
  TagRankingResponse,
} from './api';
import type { SuccessResponse } from '@/shared/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import { getChartApi, getLedgerChartApi, getLedgerTagRankingApi, getTagRankingApi } from './api';
import { chartKeys } from './keys';

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

export function useLedgerChartQuery(options: {
  params: { ledgerId: string; filters: GetChartApiParams };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetChartApiResponse>>, 'queryFn' | 'queryKey'>;
}) {
  const { ledgerId, filters } = options.params;
  const { data: response, ...rest } = useQuery<SuccessResponse<GetChartApiResponse>>({
    queryFn: async () => assertSuccessApi(await getLedgerChartApi(ledgerId, filters)),
    queryKey: chartKeys.ledgerList(ledgerId, filters),
    ...options.queryOptions,
  });
  return {
    data: isSuccessApi(response) ? response.data : [],
    response,
    ...rest,
  };
}

export function useTagRankingQuery(options: { params: GetTagRankingParams; enabled?: boolean }) {
  const query = useQuery<SuccessResponse<TagRankingResponse>>({
    queryFn: () => getTagRankingApi(options.params),
    queryKey: chartKeys.tagRanking(options.params),
    enabled: options.enabled ?? true,
  });
  return { ...query, data: isSuccessApi(query.data) ? query.data.data : undefined };
}

export function useLedgerTagRankingQuery(options: { params: { ledgerId: string; filters: GetTagRankingParams }; enabled?: boolean }) {
  const query = useQuery<SuccessResponse<TagRankingResponse>>({
    queryFn: () => getLedgerTagRankingApi(options.params.ledgerId, options.params.filters),
    queryKey: chartKeys.ledgerTagRanking(options.params.ledgerId, options.params.filters),
    enabled: options.enabled ?? true,
  });
  return { ...query, data: isSuccessApi(query.data) ? query.data.data : undefined };
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
