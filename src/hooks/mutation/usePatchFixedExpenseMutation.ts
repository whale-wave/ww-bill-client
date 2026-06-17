import type { UpdateFixedExpenseApiData } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchFixedExpenseApi } from '@/api';
import { fixedExpenseKeys } from '@/hooks/query/keys/fixedExpenseKeys';

export function usePatchFixedExpenseMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: { id: string; params: UpdateFixedExpenseApiData }) =>
      patchFixedExpenseApi(params.id, params.params),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.detail(variables.id) }),
      ]);
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
