import type { UseQueryOptions } from '@tanstack/react-query';
import type { FixedExpenseSummary, GetFixedExpenseListResponseData, GetFixedExpenseQuery } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getFixedExpenseApi } from '@/api';
import { fixedExpenseKeys } from '@/hooks/query/keys/fixedExpenseKeys';
import { isSuccessApi } from '@/utils';

const emptySummary: FixedExpenseSummary = {
  monthlyTotal: '0',
  yearlyTotal: '0',
  activeMonthlyTotal: '0',
  nextBillingItems: [],
};

interface UseGetFixedExpenseQueryOptions {
  params?: GetFixedExpenseQuery;
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<GetFixedExpenseListResponseData>,
      unknown,
      SuccessResponse<GetFixedExpenseListResponseData>,
      ReturnType<typeof fixedExpenseKeys.list>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useGetFixedExpenseQuery(options: UseGetFixedExpenseQueryOptions = {}) {
  const queryKey = fixedExpenseKeys.list(options.params);
  const { data: response, ...rest } = useQuery({
    queryFn: () => getFixedExpenseApi(options.params),
    queryKey,
    ...options.queryOptions,
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
