import type { AndroidPlatformReleaseManifest, AndroidReleaseManifest, ClientReleaseManifest, WebReleaseManifest } from './types';
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

export function getWebLatestReleaseApi(): Promise<SuccessResponse<WebReleaseManifest>> {
  return request.get<unknown, SuccessResponse<WebReleaseManifest>>('/client/releases/latest?platform=web', { silent: true, timeout: 5000 });
}

export function getAndroidPlatformLatestReleaseApi(): Promise<SuccessResponse<AndroidPlatformReleaseManifest>> {
  return request.get<unknown, SuccessResponse<AndroidPlatformReleaseManifest>>('/client/releases/latest?platform=android', { silent: true, timeout: 5000 });
}

export async function getPlatformLatestReleaseApi(platform: 'web' | 'android'): Promise<SuccessResponse<ClientReleaseManifest>> {
  const response = platform === 'web' ? await getWebLatestReleaseApi() : await getAndroidPlatformLatestReleaseApi();
  const value = response.data;
  if (platform === 'web') {
    const web = value as WebReleaseManifest;
    return { ...response, data: { noticeId: web.noticeId, enabled: web.enabled, versionName: web.versionName, summary: web.title ?? web.summary, releaseNotes: web.content ?? web.releaseNotes, images: web.images ?? [], highlights: web.highlights ?? [], publishedAt: web.publishedAt, web: { enabled: web.enabled, buildId: web.buildId ?? '', noticeId: web.noticeId }, android: { enabled: false, versionCode: 0, downloadUrl: '' } } };
  }
  const android = value as AndroidPlatformReleaseManifest;
  return { ...response, data: { noticeId: android.noticeId, enabled: android.enabled, versionName: android.versionName, summary: android.title ?? android.summary, releaseNotes: android.content ?? android.releaseNotes, images: android.images ?? [], highlights: android.highlights ?? [], publishedAt: android.publishedAt, web: { enabled: false, buildId: '' }, android: { enabled: android.enabled, versionCode: android.versionCode, downloadUrl: android.downloadUrl, noticeId: android.noticeId } } };
}
