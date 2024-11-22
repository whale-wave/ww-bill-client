import { useMutation } from '@tanstack/react-query';
import { postAssetApi } from '@/api';
import { queryClient } from '@/main';
// import { useGet$GET_API_NAME$QueryQueryKey } from '@/hooks/useGet$GET_API_NAME_CASE$Query';

export function usePostAssetMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postAssetApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        // queryKey: [useGet$GET_API_NAME_CASE$QueryQueryKey],
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
