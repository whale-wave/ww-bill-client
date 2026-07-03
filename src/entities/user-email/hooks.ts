import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/entities/user';
import { postUserEmailChangeEmailApi } from './api';

export function usePostUserEmailChangeEmailMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postUserEmailChangeEmailApi,
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
