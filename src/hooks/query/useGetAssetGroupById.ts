import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAssetGroupByIdApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetAssetGroupByIdQueryKey = 'useGetAssetGroupById';

export function useGetAssetGroupById(options: {
  params: string;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getAssetGroupByIdApi(options.params),
    queryKey: [useGetAssetGroupByIdQueryKey, options.params] as const,
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
