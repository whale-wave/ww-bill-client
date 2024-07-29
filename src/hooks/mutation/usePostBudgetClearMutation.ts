import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/main';
import { useGetBudgetInfoQueryQueryKey } from '@/hooks';
import { postBudgetClearApi } from '@/api/budget.ts';

export function usePostBudgetClearMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetClearApi,
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
