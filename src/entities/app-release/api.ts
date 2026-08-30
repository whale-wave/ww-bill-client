import type { AndroidReleaseManifest } from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function getAndroidLatestReleaseApi(): Promise<SuccessResponse<AndroidReleaseManifest>> {
  return request.get<unknown, SuccessResponse<AndroidReleaseManifest>>('/client/releases/android/latest', {
    silent: true,
    timeout: 5000,
  });
}

export function getAndroidReleasesApi(): Promise<SuccessResponse<AndroidReleaseManifest[]>> {
  return request.get<unknown, SuccessResponse<AndroidReleaseManifest[]>>('/client/releases/android', { silent: true });
}
