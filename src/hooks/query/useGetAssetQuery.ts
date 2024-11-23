import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetAssetQueryQueryKey = 'useGetAssetQuery';

export function useGetAssetQuery(options?: {
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getAssetApi(),
    queryKey: [useGetAssetQueryQueryKey] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
