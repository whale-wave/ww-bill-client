import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDebounce } from 'ahooks';
import type { GetRecordApiParams } from '@/api';
import { getRecordApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetRecordQueryQueryKey = 'useGetRecordQuery' as const;

export function useGetRecordQuery(options: {
  params?: GetRecordApiParams;
  options?: {
    enabled?: boolean;
  };
  queryKey?: any[];
} = {}) {
  const { queryKey = [] } = options;

  const debounceParams = useDebounce(options?.params, { wait: 250 });
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getRecordApi(queryKey[1]),
    queryKey: [useGetRecordQueryQueryKey, debounceParams, ...queryKey] as const,
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
