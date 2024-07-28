import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';
import type { GetBudgetInfoApiParams } from '@/api/budget.ts';
import { getBudgetInfoApi } from '@/api/budget.ts';

export const useGetBudgetInfoQueryQueryKey = 'useGetBudgetInfoQuery';

export function useGetBudgetInfoQuery(options: {
  params: GetBudgetInfoApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getBudgetInfoApi(queryKey[1]),
    queryKey: [useGetBudgetInfoQueryQueryKey, options.params] as const,
    ...options.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return {};
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
