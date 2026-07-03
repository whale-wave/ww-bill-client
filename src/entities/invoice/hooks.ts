import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetInvoiceByIdApiParams, InvoiceEntity, PatchInvoiceApiData } from './api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/shared/api';
import { deleteInvoiceApi, getInvoiceApi, getInvoiceByIdApi, patchInvoiceApi, postInvoiceApi } from './api';
import { invoiceKeys } from './keys';

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
}

export function usePostInvoiceMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postInvoiceApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: invoiceKeys.details() }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function usePatchInvoiceMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: { id: string; params: PatchInvoiceApiData }) => patchInvoiceApi(params.id, params.params),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.id) }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

export function useDeleteInvoiceMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteInvoiceApi,
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
