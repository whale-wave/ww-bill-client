import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putRecordApi } from '@/api';
import { chartKeys, recordKeys } from '@/hooks/query';

export function usePutRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: Parameters<typeof putRecordApi>[1];
    }) => putRecordApi(params.id, params.data),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: recordKeys.detail({ id: variables.id }) }),
        queryClient.invalidateQueries({ queryKey: recordKeys.bills() }),
        queryClient.invalidateQueries({ queryKey: chartKeys.all }),
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
