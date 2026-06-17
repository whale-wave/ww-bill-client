import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRecordApi } from '@/api';
import { chartKeys, recordKeys } from '@/hooks/query';

export function useDeleteRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteRecordApi,
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: recordKeys.detail({ id }) }),
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
