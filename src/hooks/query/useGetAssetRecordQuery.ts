import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetRecordApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetAssetRecordQueryQueryKey = 'useGetAssetRecordQuery';

export function useGetAssetRecordQuery(options?: {
  params: string;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getAssetRecordApi({ assetId: options?.params }),
    queryKey: [useGetAssetRecordQueryQueryKey] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    data,
    response,
    ...rest,
  };
}
