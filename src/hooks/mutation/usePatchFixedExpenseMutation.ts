import type { UpdateFixedExpenseApiData } from '@/api';
import { useMutation } from '@tanstack/react-query';
import { patchFixedExpenseApi } from '@/api';
import {
  useGetFixedExpenseByIdQueryQueryKey,
  useGetFixedExpenseQueryQueryKey,
} from '@/hooks';
import { queryClient } from '@/main';

export function usePatchFixedExpenseMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: { id: string; params: UpdateFixedExpenseApiData }) =>
      patchFixedExpenseApi(params.id, params.params),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetFixedExpenseQueryQueryKey, useGetFixedExpenseByIdQueryQueryKey],
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
