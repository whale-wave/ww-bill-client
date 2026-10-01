import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api'

export interface UserAppConfig {
  userId: number | string
  appearanceTemplate?: unknown
  isDisplayAmount?: boolean
  isDisplayAmountSwitch?: boolean
}

export function useUserAppConfig({ userId, enabled }: { userId: string, enabled: boolean }) {
  return useQuery({
    queryKey: ['user-app-config', userId],
    queryFn: ({ signal }) => api.get<UserAppConfig>('/user-app-config', { signal }),
    enabled,
  })
}
