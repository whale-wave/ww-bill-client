import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAssetByIdApi } from '@/api';
import { assetKeys } from '@/hooks/query';

export function useDeleteAssetByIdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: string) => deleteAssetByIdApi(params),
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.detail(id) }),
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
