import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { Category , RecordType } from './api'
import { getCategories } from './api'

export const categoryKeys = {
  all: ['categories'] as const,
  byType: (recordType: RecordType) => ['categories', recordType] as const,
}

export function useCategories(options: {
  params: { recordType: RecordType }
  queryOptions?: Omit<UseQueryOptions<Category[], Error>, 'queryKey' | 'queryFn'>
}) {
  return useQuery<Category[], Error>({
    queryKey: categoryKeys.byType(options.params.recordType),
    queryFn: ({ signal }) => getCategories(options.params.recordType, signal),
    ...options.queryOptions,
  })
}
