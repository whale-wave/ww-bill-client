import { useQuery } from '@tanstack/react-query';
import { getRecordBillApi } from '@/api';
import { useMemo } from 'react';
import { isSuccessApi } from '@/utils';

export const useGetRecordBillQueryQueryKey = 'useGetRecordBillQuery';

export const useGetRecordBillQuery = (options?: {
  params: number;
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getRecordBillApi(queryKey[1]),
    queryKey: [useGetRecordBillQueryQueryKey, options!.params] as const,
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
