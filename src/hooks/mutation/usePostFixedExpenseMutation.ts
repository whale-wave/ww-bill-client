import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postFixedExpenseApi } from '@/api';
import { fixedExpenseKeys } from '@/hooks/query/keys/fixedExpenseKeys';

export function usePostFixedExpenseMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postFixedExpenseApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.details() }),
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
