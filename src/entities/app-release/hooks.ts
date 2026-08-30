import { useQuery } from '@tanstack/react-query';
import { getAndroidLatestReleaseApi, getAndroidReleasesApi } from './api';
import { appReleaseKeys } from './keys';

export const ANDROID_RELEASE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;

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

export function useAndroidReleasesQuery(options?: { enabled?: boolean }) {
  const { data: response, ...rest } = useQuery({
    queryKey: [...appReleaseKeys.all, 'android', 'history'],
    queryFn: getAndroidReleasesApi,
    staleTime: ANDROID_RELEASE_CHECK_INTERVAL,
    retry: false,
    enabled: options?.enabled,
  });
  return { data: response?.data ?? [], response, ...rest };
}
