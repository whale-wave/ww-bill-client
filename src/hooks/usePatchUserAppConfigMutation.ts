import { useMutation } from '@tanstack/react-query';
import { patchUserAppConfigApi } from '@/api';
import { queryClient } from '@/main';
import { useGetUserAppConfigQueryQueryKey } from '@/hooks/useGetUserAppConfigQuery';

export function usePatchUserAppConfigMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: patchUserAppConfigApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetUserAppConfigQueryQueryKey],
      });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
