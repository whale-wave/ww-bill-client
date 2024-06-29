import { useMutation } from '@tanstack/react-query';
import { deleteInvoiceApi } from '@/api';
import { queryClient } from '@/main';
import { useGetInvoiceByIdQueryQueryKey, useGetInvoiceQueryQueryKey } from '@/hooks';

export function useDeleteInvoiceMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteInvoiceApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetInvoiceQueryQueryKey, useGetInvoiceByIdQueryQueryKey],
      });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
