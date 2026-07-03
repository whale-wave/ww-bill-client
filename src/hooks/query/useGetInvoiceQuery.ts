import type { UseQueryOptions } from '@tanstack/react-query';
import type { InvoiceEntity } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getInvoiceApi } from '@/api';
import { invoiceKeys } from '@/hooks/query/keys/invoiceKeys';
import { isSuccessApi } from '@/shared/api';

export function useGetInvoiceQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<InvoiceEntity[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<InvoiceEntity[]>>({
    queryFn: () => getInvoiceApi(),
    queryKey: invoiceKeys.list(),
    ...options?.queryOptions,
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
