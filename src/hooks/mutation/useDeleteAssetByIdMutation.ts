import { useMutation } from '@tanstack/react-query';
import { useGetAssetByIdQueryQueryKey, useGetAssetQueryQueryKey } from '@/hooks/query';
import { deleteAssetByIdApi } from '@/api';
import { queryClient } from '@/main';

export function useDeleteAssetByIdMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: string) => deleteAssetByIdApi(params),
    onSuccess: () => {
      const queryKey = [useGetAssetByIdQueryQueryKey, useGetAssetQueryQueryKey];
      Promise.all(queryKey.map(key => queryClient.invalidateQueries({ queryKey: [key] })));
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}
