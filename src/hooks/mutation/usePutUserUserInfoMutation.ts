import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putUserUserInfoApi } from '@/api';
import { userKeys } from '@/hooks/query';

export function usePutUserUserInfoMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: putUserUserInfoApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.info() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
