import type { UserNotification } from '@/entities/notification';
import { describe, expect, it } from 'vitest';
import { UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { selectClientReleasePrompt } from '@/features/app-update/model/release-prompt';

function release(id: string, versionName: string, options: Partial<UserNotification> = {}): UserNotification {
  return {
    content: '',
    createdAt: '2026-09-14T00:00:00.000Z',
    id,
    payload: { promptEnabled: true, versionName },
    status: UserNotificationStatus.UNREAD,
    title: versionName,
    type: UserNotificationType.CLIENT_RELEASE,
    updatedAt: '2026-09-14T00:00:00.000Z',
    version: 1,
    ...options,
  };
}

describe('selectClientReleasePrompt', () => {
  it('chooses the newest target version once instead of walking a new account through history', () => {
    const notices = [
      release('system:9', '1.0.9'),
      release('system:10', '1.0.10'),
      release('system:11', '1.0.11'),
    ];

    expect(selectClientReleasePrompt(notices, 'web', { versionName: '1.0.8' })?.id).toBe('system:11');
    expect(selectClientReleasePrompt([
      ...notices.slice(0, 2),
      release('system:11', '1.0.11', { status: UserNotificationStatus.READ }),
    ], 'web', { versionName: '1.0.8' })).toBeNull();
  });

  it('never prompts an already current web/shortcut install, malformed metadata, or a disabled latest notice', () => {
    expect(selectClientReleasePrompt([release('system:10', '1.0.10')], 'web', { versionName: '1.0.10' })).toBeNull();
    expect(selectClientReleasePrompt([release('system:broken', 'not-a-version')], 'web', { versionName: '1.0.9' })).toBeNull();
    expect(selectClientReleasePrompt([
      release('system:10', '1.0.10'),
      release('system:11', '1.0.11', { payload: { promptEnabled: false, versionName: '1.0.11' } }),
    ], 'web', { versionName: '1.0.9' })).toBeNull();
  });

  it('uses Android versionCode as the authoritative installed-version comparison', () => {
    const current = { versionCode: 10, versionName: '1.0.10' };
    expect(selectClientReleasePrompt([
      release('system:10', '1.0.10', { payload: { promptEnabled: true, versionCode: 10 } }),
      release('system:11', '1.0.11', { payload: { promptEnabled: true, versionCode: 11 } }),
    ], 'android', current)?.id).toBe('system:11');
  });
});
