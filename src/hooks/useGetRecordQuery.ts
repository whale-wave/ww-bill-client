import { useQuery } from '@tanstack/react-query';
import { getRecordApi } from '@/api';
import { useMemo } from 'react';

function isSuccessApi<T extends SuccessResponse<any>>(
  response?: T,
): response is T {
  return response?.statusCode === 200;
}

export const useGetRecordQuery = (options?: {
  params: GetRecordType;
  options?: {
    enabled?: boolean;
  };
}) => {
  const { data: response, ...rest } = useQuery({
    queryFn: ({ queryKey }) => getRecordApi(queryKey[1]),
    queryKey: ['useGetRecordQuery', options!.params] as const,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response)) return;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
};
