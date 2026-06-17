import type { DeleteBudgetCategoryByBudgetIdApiData } from '@/api/budget.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBudgetCategoryByBudgetIdApi } from '@/api/budget.ts';
import { budgetKeys } from '@/hooks';

export function useDeleteBudgetCategoryByBudgetIdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ budgetId, data }: {
      budgetId: string | number;
      data: DeleteBudgetCategoryByBudgetIdApiData;
    }) => deleteBudgetCategoryByBudgetIdApi(budgetId, data),
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
