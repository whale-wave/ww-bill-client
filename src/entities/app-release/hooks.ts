import type { UseQueryOptions } from '@tanstack/react-query';
import type { ClientReleaseManifest } from './types';
import type { SuccessResponse } from '@/shared/api';
import { useQuery } from '@tanstack/react-query';
import { getAndroidLatestReleaseApi, getClientLatestReleaseApi } from './api';
import { appReleaseKeys } from './keys';

export const ANDROID_RELEASE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;
export const CLIENT_RELEASE_CHECK_INTERVAL = 15 * 60 * 1000;

export function clientLatestReleaseQueryOptions(force = false) {
  return {
    queryKey: appReleaseKeys.latest(),
    queryFn: getClientLatestReleaseApi,
    staleTime: force ? 0 : CLIENT_RELEASE_CHECK_INTERVAL,
    cacheTime: CLIENT_RELEASE_CHECK_INTERVAL,
    retry: false,
    meta: { persist: false },
  } as const;
}

type ClientLatestReleaseQueryOptions = Omit<
  UseQueryOptions<SuccessResponse<ClientReleaseManifest>>,
  'queryFn' | 'queryKey'
>;

export function useClientLatestReleaseQuery(options: { queryOptions?: ClientLatestReleaseQueryOptions } = {}) {
  const { data: response, ...rest } = useQuery<SuccessResponse<ClientReleaseManifest>>({
    ...clientLatestReleaseQueryOptions(),
    ...options.queryOptions,
  });
  return { data: response?.data, response, ...rest };
}

export function androidLatestReleaseQueryOptions(force = false) {
  return {
    queryKey: appReleaseKeys.latestAndroid(),
    queryFn: getAndroidLatestReleaseApi,
    staleTime: force ? 0 : ANDROID_RELEASE_CHECK_INTERVAL,
    cacheTime: ANDROID_RELEASE_CHECK_INTERVAL,
    retry: false,
    meta: { persist: false },
  } as const;
}

export function useAndroidLatestReleaseQuery(options?: { enabled?: boolean }) {
  const { data: response, ...rest } = useQuery({
    ...androidLatestReleaseQueryOptions(),
    enabled: options?.enabled,
  });
  return { data: response?.data, response, ...rest };
}
