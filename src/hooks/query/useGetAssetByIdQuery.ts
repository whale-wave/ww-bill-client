import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetByIdApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetAssetByIdQueryQueryKey = 'useGetAssetByIdQuery';

export function useGetAssetByIdQuery(options: {
  params: string;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getAssetByIdApi(options.params),
    queryKey: [useGetAssetByIdQueryQueryKey, options.params] as const,
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
