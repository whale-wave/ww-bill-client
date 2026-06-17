import type { UseQueryOptions } from '@tanstack/react-query';
import type { Asset } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetApi } from '@/api';
import { assetKeys } from '@/hooks/query/keys/assetKeys';
import { isSuccessApi } from '@/utils';

export function useGetAssetQuery(options?: {
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<Asset[]>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<Asset[]>>({
    queryFn: () => getAssetApi(),
    queryKey: assetKeys.list(),
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
}
