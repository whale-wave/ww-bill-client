import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetInvoiceByIdApiParams } from '@/api';
import { getInvoiceByIdApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetInvoiceByIdQueryQueryKey = 'useGetInvoiceByIdQuery';

export function useGetInvoiceByIdQuery(options: {
  params: GetInvoiceByIdApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getInvoiceByIdApi(queryKey[1]),
    queryKey: [useGetInvoiceByIdQueryQueryKey, options.params] as const,
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
