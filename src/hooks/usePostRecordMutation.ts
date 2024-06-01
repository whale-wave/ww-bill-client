import { useMutation } from '@tanstack/react-query';
import { postRecordApi } from '@/api';
import { queryClient } from '@/main';
import { useGetRecordQueryQueryKey } from '@/hooks/useGetRecordQuery';

export const usePostRecordMutation = () => {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postRecordApi,
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
