import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postBudgetClearApi } from '@/api/budget.ts';
import { budgetKeys } from '@/hooks';

export function usePostBudgetClearMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetClearApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.infoRoot() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
