import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetCategoryApiParams } from '@/api';
import { getCategoryApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetCategoryQueryQueryKey = 'useGetCategoryQuery';

export function useGetCategoryQuery(options?: {
  params?: GetCategoryApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getCategoryApi(queryKey[1]),
    queryKey: [useGetCategoryQueryQueryKey, options?.params] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
};
