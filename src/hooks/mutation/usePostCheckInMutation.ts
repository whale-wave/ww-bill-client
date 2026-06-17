import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postCheckInApi } from '@/api';
import { userKeys } from '@/hooks';

export function usePostCheckInMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: () => postCheckInApi(),
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
