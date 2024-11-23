import { useMutation } from '@tanstack/react-query';
import type { PatchAssetAdjustApiData } from '@/api';
import { patchAssetAdjustApi } from '@/api';
import { queryClient } from '@/main';
import { useGetAssetQueryQueryKey } from '@/hooks/query/useGetAssetQuery';

export function usePatchAssetAdjustMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: PatchAssetAdjustApiData;
    }) => patchAssetAdjustApi(params.id, params.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetAssetQueryQueryKey],
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
