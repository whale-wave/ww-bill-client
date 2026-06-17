import type { UseQueryOptions } from '@tanstack/react-query';
import type { AssetGroup } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetGroupApi } from '@/api';
import { assetKeys } from '@/hooks/query/keys/assetKeys';
import { isSuccessApi } from '@/utils';

export function useGetAssetGroupQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetGroup[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetGroup[]>>({
    queryFn: () => getAssetGroupApi(),
    queryKey: assetKeys.groups(),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
};
