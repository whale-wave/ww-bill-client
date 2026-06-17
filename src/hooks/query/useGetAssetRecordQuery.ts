import type { UseQueryOptions } from '@tanstack/react-query';
import type { AssetRecord, GetAssetRecordApiParams } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetRecordApi } from '@/api';
import { assetKeys } from '@/hooks/query/keys/assetKeys';
import { isSuccessApi } from '@/utils';

export function useGetAssetRecordQuery(options: {
  params: GetAssetRecordApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetRecord[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetRecord[]>>({
    queryFn: () => getAssetRecordApi(options.params),
    queryKey: assetKeys.record(options.params),
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
