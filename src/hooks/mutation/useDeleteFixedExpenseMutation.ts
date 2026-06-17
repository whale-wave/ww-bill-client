import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFixedExpenseApi } from '@/api';
import { fixedExpenseKeys } from '@/hooks/query/keys/fixedExpenseKeys';

export function useDeleteFixedExpenseMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteFixedExpenseApi,
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.detail(id) }),
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
