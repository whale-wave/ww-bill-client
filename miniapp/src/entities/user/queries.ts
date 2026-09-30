import { useQuery } from '@tanstack/react-query'
import { getUserInfo } from './api'

export const userKeys = { info: ['user', 'info'] as const }

export function useUserInfo(isEnabled: boolean) {
  return useQuery({
    queryKey: userKeys.info,
    queryFn: ({ signal }) => getUserInfo(signal),
    enabled: isEnabled,
  })
}
