import type { UseQueryOptions } from '@tanstack/react-query';
import type { FixedExpenseEntity, GetFixedExpenseByIdApiParams } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getFixedExpenseByIdApi } from '@/api';
import { fixedExpenseKeys } from '@/hooks/query/keys/fixedExpenseKeys';
import { isSuccessApi } from '@/utils';

interface UseGetFixedExpenseByIdQueryOptions {
  params: GetFixedExpenseByIdApiParams;
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<FixedExpenseEntity>,
      unknown,
      SuccessResponse<FixedExpenseEntity>,
      ReturnType<typeof fixedExpenseKeys.detail>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useGetFixedExpenseByIdQuery(options: UseGetFixedExpenseByIdQueryOptions) {
  const queryKey = fixedExpenseKeys.detail(options.params.id);
  const { data: response, ...rest } = useQuery({
    queryFn: () => getFixedExpenseByIdApi(options.params),
    queryKey,
    ...options.queryOptions,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
