import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postInvoiceApi } from '@/api';
import { invoiceKeys } from '@/hooks';

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
