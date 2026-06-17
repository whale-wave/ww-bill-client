import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteInvoiceApi } from '@/api';
import { invoiceKeys } from '@/hooks';

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
