import type { PatchAssetAdjustApiData } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchAssetAdjustApi } from '@/api';
import { assetKeys } from '@/hooks/query';

export function usePatchAssetAdjustMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: PatchAssetAdjustApiData;
    }) => patchAssetAdjustApi(params.id, params.data),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: assetKeys.detail(variables.id) }),
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
