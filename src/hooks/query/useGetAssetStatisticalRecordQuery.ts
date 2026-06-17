import type { UseQueryOptions } from '@tanstack/react-query';
import type { AssetStatisticalRecord, GetAssetStatisticalRecordApiParams } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetStatisticalRecordApi } from '@/api';
import { assetKeys } from '@/hooks/query/keys/assetKeys';
import { isSuccessApi } from '@/utils';

export function useGetAssetStatisticalRecordQuery(options: {
  params: GetAssetStatisticalRecordApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetStatisticalRecord[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetStatisticalRecord[]>>({
    queryFn: () => getAssetStatisticalRecordApi(options.params),
    queryKey: assetKeys.statisticalRecord(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    data,
    response,
    ...rest,
  };
}
