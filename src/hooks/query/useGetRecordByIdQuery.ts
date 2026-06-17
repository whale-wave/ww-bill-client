import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetRecordByIdApiParams, RecordEntry } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRecordByIdApi } from '@/api';
import { recordKeys } from '@/hooks/query/keys/recordKeys';
import { isSuccessApi } from '@/utils';

export function useGetRecordByIdQuery(options?: {
  params: GetRecordByIdApiParams;
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<RecordEntry>>, 'queryFn' | 'queryKey'>;
  options?: {
    enabled?: boolean;
  };
}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<RecordEntry>>({
    queryFn: () => getRecordByIdApi(options!.params),
    queryKey: recordKeys.detail(options!.params),
    ...options?.queryOptions,
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
