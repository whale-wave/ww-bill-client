import { useMutation } from '@tanstack/react-query';
import { useGetAssetByIdQueryQueryKey, useGetAssetQueryQueryKey, useGetAssetRecordQueryQueryKey } from '../query';
import type { PatchAssetAdjustApiData } from '@/api';
import { patchAssetAdjustApi } from '@/api';
import { queryClient } from '@/main';

export function usePatchAssetAdjustMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: PatchAssetAdjustApiData;
    }) => patchAssetAdjustApi(params.id, params.data),
    onSuccess: () => {
      const queryKeys = [useGetAssetQueryQueryKey, useGetAssetByIdQueryQueryKey, useGetAssetRecordQueryQueryKey];
      Promise.all(queryKeys.map(key => queryClient.invalidateQueries({
        queryKey: [key],
      })));
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
