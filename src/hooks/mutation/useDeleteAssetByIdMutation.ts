import { useMutation } from '@tanstack/react-query';
import { useGetAssetByIdQueryQueryKey, useGetAssetQueryQueryKey } from '@/hooks/query';
import { deleteAssetByIdApi } from '@/api';
import { queryClient } from '@/main';

export function useDeleteAssetByIdMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: string) => deleteAssetByIdApi(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetAssetByIdQueryQueryKey, useGetAssetQueryQueryKey],
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
