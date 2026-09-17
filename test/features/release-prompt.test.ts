import type { ClientReleaseManifest } from '@/entities/app-release';
import type { UserNotification } from '@/entities/notification';
import { describe, expect, it } from 'vitest';
import { UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { androidReleaseNotification, isAndroidUpdateAvailable, selectWebReleasePrompt } from '@/features/app-update/model/release-prompt';

function release(id: string, versionName: string, status = UserNotificationStatus.UNREAD): UserNotification {
  return {
    content: '更新内容',
    createdAt: '2026-09-14T00:00:00.000Z',
    id,
    payload: { versionName },
    status,
    title: versionName,
    type: UserNotificationType.CLIENT_RELEASE,
    updatedAt: '2026-09-14T00:00:00.000Z',
    version: 1,
  };
}

function androidRelease(overrides: Partial<ClientReleaseManifest> = {}): ClientReleaseManifest {
  return {
    android: { downloadUrl: 'https://example.com/bill.apk', enabled: true, versionCode: 11 },
    enabled: true,
    highlights: [],
    images: ['https://example.com/release.webp'],
    publishedAt: '2026-09-14T00:00:00.000Z',
    releaseNotes: '修复同步体验。',
    summary: 'v1.0.11 更新',
    versionName: '1.0.11',
    web: { buildId: '', enabled: false },
    ...overrides,
  };
}

describe('release prompts', () => {
  it('shows only the latest unread Web release and never falls back to history', () => {
    expect(selectWebReleasePrompt([
      release('system:9', '1.0.9'),
      release('system:10', '1.0.10'),
    ])?.id).toBe('system:10');
    expect(selectWebReleasePrompt([
      release('system:9', '1.0.9'),
      release('system:10', '1.0.10', UserNotificationStatus.READ),
    ])).toBeNull();
  });

  it('uses only the public Android latest release, its version code, and its download URL', () => {
    const current = androidRelease();
    expect(isAndroidUpdateAvailable(current, { versionCode: 10 })).toBe(true);
    expect(isAndroidUpdateAvailable(current, { versionCode: 11 })).toBe(false);
    expect(isAndroidUpdateAvailable(androidRelease({ enabled: false }), { versionCode: 10 })).toBe(false);
    expect(isAndroidUpdateAvailable(androidRelease({ android: { downloadUrl: '', enabled: true, versionCode: 11 } }), { versionCode: 10 })).toBe(false);
    expect(androidReleaseNotification(current)).toMatchObject({
      content: '修复同步体验。',
      id: 'client-release:11',
      payload: { downloadUrl: 'https://example.com/bill.apk', images: ['https://example.com/release.webp'], versionCode: 11 },
    });
  });
});
