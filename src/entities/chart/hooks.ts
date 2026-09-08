import type { UseInfiniteQueryOptions, UseQueryOptions } from '@tanstack/react-query';
import type {
  ChartPeriodOptionsPage,
  ChartPeriodResult,
  GetChartApiParams,
  GetChartApiResponse,
  GetChartApiResponseMonthData,
  GetChartApiResponseWeekData,
  GetChartApiResponseYearData,
  GetChartPeriodApiParams,
  GetChartPeriodOptionsApiParams,
  GetTagRankingParams,
  TagRankingResponse,
} from './api';
import type { SuccessResponse } from '@/shared/api';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { assertSuccessApi, isSuccessApi } from '@/shared/api';
import {
  getChartApi,
  getChartPeriodApi,
  getChartPeriodOptionsApi,
  getLedgerChartApi,
  getLedgerChartPeriodApi,
  getLedgerChartPeriodOptionsApi,
  getLedgerTagRankingApi,
  getTagRankingApi,
} from './api';
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

type ChartPeriodOptionsResponse = SuccessResponse<ChartPeriodOptionsPage>;

function getOlderPeriodPage(page: ChartPeriodOptionsResponse) {
  const totalPages = Math.ceil(page.data.total / page.data.pageSize);
  return page.data.current < totalPages ? page.data.current + 1 : undefined;
}

function getNewerPeriodPage(page: ChartPeriodOptionsResponse) {
  return page.data.current > 1 ? page.data.current - 1 : undefined;
}

export function flattenChartPeriodOptions(pages: ChartPeriodOptionsResponse[] = []) {
  const options = new Map<string, ChartPeriodOptionsPage['data'][number]>();
  pages.forEach(page => page.data.data.forEach(option => options.set(option.key, option)));
  return [...options.values()].sort((left, right) => left.anchorDate.localeCompare(right.anchorDate));
}

export function useChartPeriodOptionsQuery(options: {
  params: Omit<GetChartPeriodOptionsApiParams, 'current'>;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      ChartPeriodOptionsResponse,
      unknown,
      ChartPeriodOptionsResponse,
      ChartPeriodOptionsResponse,
      ReturnType<typeof chartKeys.periodOptions>
    >,
    'getNextPageParam' | 'getPreviousPageParam' | 'queryFn' | 'queryKey'
  >;
}) {
  const query = useInfiniteQuery({
    queryKey: chartKeys.periodOptions(options.params),
    queryFn: async ({ pageParam }) => assertSuccessApi(await getChartPeriodOptionsApi({
      ...options.params,
      ...(pageParam === undefined ? {} : { current: pageParam as number }),
    })),
    getNextPageParam: getOlderPeriodPage,
    getPreviousPageParam: getNewerPeriodPage,
    ...options.queryOptions,
  });
  return {
    ...query,
    options: flattenChartPeriodOptions(query.data?.pages),
    response: query.data?.pages[0],
  };
}

export function useLedgerChartPeriodOptionsQuery(options: {
  params: { ledgerId: string; filters: Omit<GetChartPeriodOptionsApiParams, 'current'> };
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      ChartPeriodOptionsResponse,
      unknown,
      ChartPeriodOptionsResponse,
      ChartPeriodOptionsResponse,
      ReturnType<typeof chartKeys.ledgerPeriodOptions>
    >,
    'getNextPageParam' | 'getPreviousPageParam' | 'queryFn' | 'queryKey'
  >;
}) {
  const { filters, ledgerId } = options.params;
  const query = useInfiniteQuery({
    queryKey: chartKeys.ledgerPeriodOptions(ledgerId, filters),
    queryFn: async ({ pageParam }) => assertSuccessApi(await getLedgerChartPeriodOptionsApi(ledgerId, {
      ...filters,
      ...(pageParam === undefined ? {} : { current: pageParam as number }),
    })),
    getNextPageParam: getOlderPeriodPage,
    getPreviousPageParam: getNewerPeriodPage,
    ...options.queryOptions,
  });
  return {
    ...query,
    options: flattenChartPeriodOptions(query.data?.pages),
    response: query.data?.pages[0],
  };
}

export function chartPeriodQueryOptions(params: GetChartPeriodApiParams) {
  return {
    queryFn: async () => assertSuccessApi(await getChartPeriodApi(params)),
    queryKey: chartKeys.period(params),
    staleTime: 30_000,
  };
}

export function ledgerChartPeriodQueryOptions(ledgerId: string, params: GetChartPeriodApiParams) {
  return {
    queryFn: async () => assertSuccessApi(await getLedgerChartPeriodApi(ledgerId, params)),
    queryKey: chartKeys.ledgerPeriod(ledgerId, params),
    staleTime: 30_000,
  };
}

export function useChartPeriodQuery(options: {
  params: GetChartPeriodApiParams;
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<ChartPeriodResult>,
      unknown,
      SuccessResponse<ChartPeriodResult>,
      ReturnType<typeof chartKeys.period>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const queryClient = useQueryClient();
  const query = useQuery<
    SuccessResponse<ChartPeriodResult>,
    unknown,
    SuccessResponse<ChartPeriodResult>,
    ReturnType<typeof chartKeys.period>
  >({
    ...chartPeriodQueryOptions(options.params),
    ...options.queryOptions,
  });
  const prefetch = useCallback(
    (params: GetChartPeriodApiParams) => queryClient.prefetchQuery(chartPeriodQueryOptions(params)),
    [queryClient],
  );
  return {
    ...query,
    data: query.data?.data,
    prefetch,
    response: query.data,
  };
}

export function useLedgerChartPeriodQuery(options: {
  params: { ledgerId: string; filters: GetChartPeriodApiParams };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<ChartPeriodResult>,
      unknown,
      SuccessResponse<ChartPeriodResult>,
      ReturnType<typeof chartKeys.ledgerPeriod>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const queryClient = useQueryClient();
  const query = useQuery<
    SuccessResponse<ChartPeriodResult>,
    unknown,
    SuccessResponse<ChartPeriodResult>,
    ReturnType<typeof chartKeys.ledgerPeriod>
  >({
    ...ledgerChartPeriodQueryOptions(options.params.ledgerId, options.params.filters),
    ...options.queryOptions,
  });
  const ledgerId = options.params.ledgerId;
  const prefetch = useCallback(
    (params: GetChartPeriodApiParams) =>
      queryClient.prefetchQuery(ledgerChartPeriodQueryOptions(ledgerId, params)),
    [ledgerId, queryClient],
  );
  return {
    ...query,
    data: query.data?.data,
    prefetch,
    response: query.data,
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
