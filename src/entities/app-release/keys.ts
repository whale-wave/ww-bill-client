export const appReleaseKeys = {
  all: ['app-release'] as const,
  latest: (platform: 'web' | 'android' = 'web') => [...appReleaseKeys.all, platform, 'latest'] as const,
  latestAndroid: () => [...appReleaseKeys.all, 'android', 'latest'] as const,
};
