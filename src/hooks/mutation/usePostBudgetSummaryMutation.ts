import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/main';
import { useGetBudgetInfoQueryQueryKey } from '@/hooks';
import { postBudgetSummaryApi } from '@/api/budget.ts';

export function usePostBudgetSummaryMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetSummaryApi,
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
