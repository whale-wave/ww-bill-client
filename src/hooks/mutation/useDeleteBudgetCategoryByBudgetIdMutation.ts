import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/main';
import { useGetBudgetInfoQueryQueryKey } from '@/hooks';
import type { DeleteBudgetCategoryByBudgetIdApiData } from '@/api/budget.ts';
import { deleteBudgetCategoryByBudgetIdApi } from '@/api/budget.ts';

export function useDeleteBudgetCategoryByBudgetIdMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ budgetId, data }: {
      budgetId: string | number;
      data: DeleteBudgetCategoryByBudgetIdApiData;
    }) => deleteBudgetCategoryByBudgetIdApi(budgetId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetBudgetInfoQueryQueryKey],
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
