import { useInfiniteQuery } from '@tanstack/react-query'
import { getRecords } from './api'

export const recordKeys = {
  all: ['records'] as const,
  month: (month: string) => ['records', 'month', month] as const,
}

const PAGE_SIZE = 50

export function useMonthRecords(month: string, isEnabled: boolean) {
  return useInfiniteQuery({
    queryKey: recordKeys.month(month),
    queryFn: ({ pageParam = 0, signal }) => getRecords(`${month}-01`, pageParam, PAGE_SIZE, signal),
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((count, page) => count + page.data.length, 0)
      return loaded < lastPage.total && lastPage.data.length > 0 ? loaded : undefined
    },
    enabled: isEnabled,
  })
}
