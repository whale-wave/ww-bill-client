import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetGroupApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetAssetGroupQueryQueryKey = 'useGetAssetGroupQuery';

export function useGetAssetGroupQuery(options?: {
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getAssetGroupApi(),
    queryKey: [useGetAssetGroupQueryQueryKey] as const,
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
};
