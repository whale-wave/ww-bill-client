import { useMutation } from '@tanstack/react-query';
import { postFixedExpenseApi } from '@/api';
import {
  useGetFixedExpenseByIdQueryQueryKey,
  useGetFixedExpenseQueryQueryKey,
} from '@/hooks';
import { queryClient } from '@/main';

export function usePostFixedExpenseMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postFixedExpenseApi,
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
