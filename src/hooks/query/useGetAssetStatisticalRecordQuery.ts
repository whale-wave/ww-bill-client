import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetAssetStatisticalRecordApiParams } from '@/api';
import { getAssetStatisticalRecordApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetAssetStatisticalRecordQueryQueryKey = 'useGetAssetStatisticalRecordQuery';

export function useGetAssetStatisticalRecordQuery(options: {
  params: GetAssetStatisticalRecordApiParams;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getAssetStatisticalRecordApi(options.params),
    queryKey: [useGetAssetStatisticalRecordQueryQueryKey, options.params] as const,
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
