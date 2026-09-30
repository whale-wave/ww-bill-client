import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { UserInfo } from './api'
import { getUserInfo } from './api'

export const userKeys = { info: ['user', 'info'] as const }

export function useUserInfo(options: {
  queryOptions?: Omit<UseQueryOptions<UserInfo, Error>, 'queryKey' | 'queryFn'>
} = {}) {
  return useQuery<UserInfo, Error>({
    queryKey: userKeys.info,
    queryFn: ({ signal }) => getUserInfo(signal),
    ...options.queryOptions,
  })
}
