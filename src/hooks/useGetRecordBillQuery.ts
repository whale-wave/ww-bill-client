import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetRecordBillApiParams } from '@/api';
import { getRecordBillApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetRecordBillQueryQueryKey = 'useGetRecordBillQuery';

export function useGetRecordBillQuery(options?: {
  params: GetRecordBillApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getRecordBillApi(queryKey[1]),
    queryKey: [useGetRecordBillQueryQueryKey, options!.params] as const,
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
