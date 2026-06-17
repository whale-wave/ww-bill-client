import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postBudgetCategoryApi } from '@/api/budget.ts';
import { budgetKeys } from '@/hooks';

export function usePostBudgetCategoryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetCategoryApi,
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
