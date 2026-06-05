import type { GetFixedExpenseByIdApiParams } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getFixedExpenseByIdApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetFixedExpenseByIdQueryQueryKey = 'useGetFixedExpenseByIdQuery';

export function useGetFixedExpenseByIdQuery(options: {
  params: GetFixedExpenseByIdApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getFixedExpenseByIdApi(queryKey[1] as GetFixedExpenseByIdApiParams),
    queryKey: [useGetFixedExpenseByIdQueryQueryKey, options.params] as const,
    ...options?.options,
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
