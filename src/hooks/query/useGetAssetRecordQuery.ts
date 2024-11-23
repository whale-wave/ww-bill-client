import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetRecordApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetAssetRecordQueryQueryKey = 'useGetAssetRecordQuery';

export function useGetAssetRecordQuery(options: {
  params: {
    assetId: string;
    startTime: number;
    endTime: number;
  };
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getAssetRecordApi(options.params),
    queryKey: [useGetAssetRecordQueryQueryKey, options.params] as const,
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
