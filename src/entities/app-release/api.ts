import type { AndroidReleaseManifest, ClientReleaseManifest } from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function getAndroidLatestReleaseApi(): Promise<SuccessResponse<AndroidReleaseManifest>> {
  return request.get<unknown, SuccessResponse<AndroidReleaseManifest>>('/client/releases/android/latest', {
    silent: true,
    timeout: 5000,
  });
}

export function getClientLatestReleaseApi(): Promise<SuccessResponse<ClientReleaseManifest>> {
  return request.get<unknown, SuccessResponse<ClientReleaseManifest>>('/client/releases/latest', {
    silent: true,
    timeout: 5000,
  });
}
