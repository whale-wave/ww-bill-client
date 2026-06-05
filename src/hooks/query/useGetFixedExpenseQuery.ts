import type { FixedExpenseSummary, GetFixedExpenseQuery } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getFixedExpenseApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetFixedExpenseQueryQueryKey = 'useGetFixedExpenseQuery';

const emptySummary: FixedExpenseSummary = {
  monthlyTotal: '0',
  yearlyTotal: '0',
  activeMonthlyTotal: '0',
  nextBillingItems: [],
};

export function useGetFixedExpenseQuery(options?: {
  params?: GetFixedExpenseQuery;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getFixedExpenseApi(queryKey[1] as GetFixedExpenseQuery | undefined),
    queryKey: [useGetFixedExpenseQueryQueryKey, options?.params] as const,
    ...options?.options,
  });

  const list = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data.list;
  }, [response]);

  const summary = useMemo(() => {
    if (!isSuccessApi(response))
      return emptySummary;
    return response.data.summary;
  }, [response]);

  return {
    response,
    list,
    summary,
    ...rest,
  };
}
