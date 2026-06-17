import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetBudgetInfoApiResponseData } from '@/api';
import type { GetBudgetInfoApiParams } from '@/api/budget.ts';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getBudgetInfoApi } from '@/api/budget.ts';
import { budgetKeys } from '@/hooks/query/keys/budgetKeys';
import { isSuccessApi } from '@/utils';

const emptyBudgetInfo: GetBudgetInfoApiResponseData = {
  categoryBudgets: [],
};

export function useGetBudgetInfoQuery(options: {
  params: GetBudgetInfoApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetBudgetInfoApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetBudgetInfoApiResponseData>>({
    queryFn: () => getBudgetInfoApi(options.params),
    queryKey: budgetKeys.info(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return emptyBudgetInfo;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
