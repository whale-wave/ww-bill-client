import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetRecordByIdApiParams } from '@/api';
import { getRecordByIdApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetRecordByIdQueryQueryKey = 'useGetRecordByIdQuery';

export function useGetRecordByIdQuery(options?: {
  params: GetRecordByIdApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getRecordByIdApi(queryKey[1]),
    queryKey: [useGetRecordByIdQueryQueryKey, options!.params] as const,
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
};
