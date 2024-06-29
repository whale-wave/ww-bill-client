import { useMutation } from '@tanstack/react-query';
import type { PatchInvoiceApiData } from '@/api';
import { patchInvoiceApi } from '@/api';
import { queryClient } from '@/main';
import { useGetInvoiceByIdQueryQueryKey, useGetInvoiceQueryQueryKey } from '@/hooks';

export function usePatchInvoiceMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: { id: string; params: PatchInvoiceApiData }) => patchInvoiceApi(params.id, params.params),
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
