import type {
  PatchBudgetAmountByBudgetIdApiData,
} from '@/api/budget.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  patchBudgetAmountByBudgetIdApi,
} from '@/api/budget.ts';
import { budgetKeys } from '@/hooks';

export function usePatchBudgetAmountByBudgetIdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ budgetId, data }: {
      budgetId: string | number;
      data: PatchBudgetAmountByBudgetIdApiData;
    }) => patchBudgetAmountByBudgetIdApi(budgetId, data),
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
