import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/main';
import { useGetBudgetInfoQueryQueryKey } from '@/hooks';
import { postBudgetCategoryApi } from '@/api/budget.ts';

export function usePostBudgetCategoryMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postBudgetCategoryApi,
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
