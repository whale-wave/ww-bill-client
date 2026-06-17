import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchUserAppConfigApi } from '@/api';
import { userKeys } from '@/hooks/query';

export function usePatchUserAppConfigMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: patchUserAppConfigApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.appConfig() });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
