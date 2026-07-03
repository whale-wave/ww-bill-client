import type { UseQueryOptions } from '@tanstack/react-query';
import type { AssetGroup } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetGroupByIdApi } from '@/api';
import { assetKeys } from '@/hooks/query/keys/assetKeys';
import { isSuccessApi } from '@/shared/api';

export function useGetAssetGroupById(options: {
  params: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<AssetGroup>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<AssetGroup>>({
    queryFn: () => getAssetGroupByIdApi(options.params),
    queryKey: assetKeys.group(options.params),
    ...options.queryOptions,
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
