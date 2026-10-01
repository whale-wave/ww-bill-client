import { api } from '../../shared/api'

export interface AchievementSummary {
  currentTitle: { code: string, name: string } | null
}

export function getAchievementSummary(signal?: AbortSignal) {
  return api.get<AchievementSummary>('/achievement/summary', { signal })
}

