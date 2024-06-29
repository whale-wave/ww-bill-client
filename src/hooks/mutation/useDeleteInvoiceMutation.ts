import { useMutation } from '@tanstack/react-query';
import { deleteInvoiceApi } from '@/api';
import { queryClient } from '@/main';
import { useGetInvoiceQueryQueryKey } from '@/hooks';

export function useDeleteInvoiceMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteInvoiceApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetInvoiceQueryQueryKey],
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
