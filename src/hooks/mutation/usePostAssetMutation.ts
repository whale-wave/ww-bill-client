import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAssetApi } from '@/api';
import { assetKeys } from '@/hooks/query';

export function usePostAssetMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: postAssetApi,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.details() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.records() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.statisticalRecords() }),
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
