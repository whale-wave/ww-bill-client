import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postBudgetSummaryApi } from '@/api/budget.ts';
import { budgetKeys } from '@/hooks';

export function usePostBudgetSummaryMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetSummaryApi,
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
