import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { AchievementSummary } from './api'
import { getAchievementSummary } from './api'

export const achievementKeys = { summary: ['achievement', 'summary'] as const }

export function useAchievementSummary(options: {
  queryOptions?: Omit<UseQueryOptions<AchievementSummary, Error>, 'queryKey' | 'queryFn'>
} = {}) {
  return useQuery<AchievementSummary, Error>({
    queryKey: achievementKeys.summary,
    queryFn: ({ signal }) => getAchievementSummary(signal),
    ...options.queryOptions,
  })
}

