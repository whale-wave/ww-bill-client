import { useMutation } from '@tanstack/react-query';
import { deleteFixedExpenseApi } from '@/api';
import {
  useGetFixedExpenseByIdQueryQueryKey,
  useGetFixedExpenseQueryQueryKey,
} from '@/hooks';
import { queryClient } from '@/main';

export function useDeleteFixedExpenseMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteFixedExpenseApi,
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
