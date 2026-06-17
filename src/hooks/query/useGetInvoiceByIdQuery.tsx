import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetInvoiceByIdApiParams, InvoiceEntity } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getInvoiceByIdApi } from '@/api';
import { invoiceKeys } from '@/hooks/query/keys/invoiceKeys';
import { isSuccessApi } from '@/utils';

export function useGetInvoiceByIdQuery(options: {
  params: GetInvoiceByIdApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<InvoiceEntity>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<InvoiceEntity>>({
    queryFn: () => getInvoiceByIdApi(options.params),
    queryKey: invoiceKeys.detail(options.params.id),
    ...options.queryOptions,
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
