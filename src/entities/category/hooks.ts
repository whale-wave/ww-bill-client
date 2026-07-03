import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetCategoryApiParams, GetCategoryApiResponseData } from './api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { isSuccessApi } from '@/shared/api';
import { getCategoryApi } from './api';
import { categoryKeys } from './keys';

export function useGetCategoryQuery(options?: {
  params?: GetCategoryApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetCategoryApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetCategoryApiResponseData>>({
    queryFn: () => getCategoryApi(options?.params),
    queryKey: categoryKeys.list(options?.params),
    ...options?.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return [];
    return response.data.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
