import type { UseQueryOptions } from '@tanstack/react-query';
import type { Asset } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetByIdApi } from '@/api';
import { assetKeys } from '@/hooks/query/keys/assetKeys';
import { isSuccessApi } from '@/shared/api';

export function useGetAssetByIdQuery(options: {
  params: string;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<Asset>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<Asset>>({
    queryFn: () => getAssetByIdApi(options.params),
    queryKey: assetKeys.detail(options.params),
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
