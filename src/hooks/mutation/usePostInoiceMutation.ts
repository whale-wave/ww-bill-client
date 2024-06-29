import { useMutation } from '@tanstack/react-query';
import { postInvoiceApi } from '@/api';
import { queryClient } from '@/main';
import { useGetInvoiceByIdQueryQueryKey, useGetInvoiceQueryQueryKey } from '@/hooks';

export function usePostInvoiceMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postInvoiceApi,
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
