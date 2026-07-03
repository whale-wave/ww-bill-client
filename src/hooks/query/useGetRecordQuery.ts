import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetRecordApiParams, GetRecordApiResponseData } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRecordApi } from '@/api';
import { recordKeys } from '@/hooks/query/keys/recordKeys';
import { isSuccessApi } from '@/shared/api';

const emptyRecordInfo: GetRecordApiResponseData = {
  total: 0,
  data: [],
  expend: 0,
  income: 0,
};

export function useGetRecordQuery(options: {
  params?: GetRecordApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<GetRecordApiResponseData>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
} = {}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<GetRecordApiResponseData>>({
    queryFn: () => getRecordApi(options.params),
    queryKey: recordKeys.list(options.params),
    ...options.queryOptions,
    ...options?.options,
  });

  const data = useMemo(() => {
    if (!isSuccessApi(response))
      return emptyRecordInfo;
    return response.data;
  }, [response]);

  return {
    response,
    data,
    ...rest,
  };
}
