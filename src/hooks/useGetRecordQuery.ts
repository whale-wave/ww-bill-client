import { useQuery } from '@tanstack/react-query';
import { getRecordApi, GetRecordApiParams } from '@/api';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';

export const useGetRecordQueryQueryKey = 'useGetRecordQuery' as const;

export const useGetRecordQuery = (options?: {
  params: GetRecordApiParams;
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getRecordApi(queryKey[1]),
    queryKey: [useGetRecordQueryQueryKey, options!.params] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response)) return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
};
