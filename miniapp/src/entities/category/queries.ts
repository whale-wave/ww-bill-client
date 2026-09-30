import { useQuery } from '@tanstack/react-query'
import type { RecordType } from './api'
import { getCategories } from './api'

export const categoryKeys = {
  all: ['categories'] as const,
  byType: (recordType: RecordType) => ['categories', recordType] as const,
}

export function useCategories(recordType: RecordType, isEnabled: boolean) {
  return useQuery({
    queryKey: categoryKeys.byType(recordType),
    queryFn: ({ signal }) => getCategories(recordType, signal),
    enabled: isEnabled,
  })
}
