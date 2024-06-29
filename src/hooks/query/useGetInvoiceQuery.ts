import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getInvoiceApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetInvoiceQueryQueryKey = 'useGetInvoiceQuery';

export function useGetInvoiceQuery(options?: {
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getInvoiceApi(),
    queryKey: [useGetInvoiceQueryQueryKey] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
