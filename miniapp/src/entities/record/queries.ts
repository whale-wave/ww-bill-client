import { useInfiniteQuery, type UseInfiniteQueryOptions } from '@tanstack/react-query'
import type { RecordPage } from './api'
import { getRecords } from './api'
import { nextRecordPageOffset } from './paging'

export const recordKeys = {
  all: ['records'] as const,
  month: (month: string) => ['records', 'month', month] as const,
}

const PAGE_SIZE = 50

export function useMonthRecords(options: {
  params: { month: string }
  queryOptions?: Omit<UseInfiniteQueryOptions<RecordPage, Error>, 'queryKey' | 'queryFn' | 'getNextPageParam'>
}) {
  return useInfiniteQuery<RecordPage, Error>({
    queryKey: recordKeys.month(options.params.month),
    queryFn: ({ pageParam = 0, signal }) => getRecords(`${options.params.month}-01`, Number(pageParam), PAGE_SIZE, signal),
    getNextPageParam: nextRecordPageOffset,
    ...options.queryOptions,
  })
}
