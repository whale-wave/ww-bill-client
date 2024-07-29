import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/main';
import { useGetBudgetInfoQueryQueryKey } from '@/hooks';
import type {
  PatchBudgetAmountByBudgetIdApiData,
} from '@/api/budget.ts';
import {
  patchBudgetAmountByBudgetIdApi,
} from '@/api/budget.ts';

export function usePatchBudgetAmountByBudgetIdMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: ({ budgetId, data }: {
      budgetId: string | number;
      data: PatchBudgetAmountByBudgetIdApiData;
    }) => patchBudgetAmountByBudgetIdApi(budgetId, data),
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
