import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getUserAppConfigApi } from '@/api';
import { isSuccessApi } from '@/utils';

export const useGetUserAppConfigQueryQueryKey = 'useGetUserAppConfigQuery';

export function useGetUserAppConfigQuery(options?: {
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getUserAppConfigApi(),
    queryKey: [useGetUserAppConfigQueryQueryKey] as const,
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
