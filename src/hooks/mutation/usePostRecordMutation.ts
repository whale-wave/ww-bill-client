import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postRecordApi } from '@/api';
import { chartKeys, recordKeys } from '@/hooks/query';

export function usePostRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postRecordApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
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
