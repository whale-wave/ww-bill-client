import type { PatchInvoiceApiData } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchInvoiceApi } from '@/api';
import { invoiceKeys } from '@/hooks';

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
