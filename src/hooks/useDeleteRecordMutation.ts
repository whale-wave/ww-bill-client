import { useMutation } from '@tanstack/react-query';
import { deleteRecordApi } from '@/api';
import { queryClient } from '@/main';
import { useGetRecordQueryQueryKey } from '@/hooks/useGetRecordQuery';

export const useDeleteRecordMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteRecordApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetRecordQueryQueryKey],
      });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
};
