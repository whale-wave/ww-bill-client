import type { ClientReleaseManifest } from '@/entities/app-release';
import type { UserNotification } from '@/entities/notification';
import { UserNotificationStatus, UserNotificationType } from '@/entities/notification';

export interface InstalledAndroidVersion {
  versionCode: number | null;
}

function compareReleaseVersion(left: UserNotification, right: UserNotification) {
  const leftVersion = typeof left.payload?.versionName === 'string' ? left.payload.versionName : '';
  const rightVersion = typeof right.payload?.versionName === 'string' ? right.payload.versionName : '';
  return rightVersion.localeCompare(leftVersion, undefined, { numeric: true, sensitivity: 'base' })
    || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    || right.id.localeCompare(left.id);
}

/**
 * A Web release is editorial content, rather than an update gate. Only the
 * newest release can interrupt the user; once it is read we never fall back to
 * an older release announcement.
 */
export function selectWebReleasePrompt(notifications: UserNotification[]) {
  const latest = notifications
    .filter(item => item.type === UserNotificationType.CLIENT_RELEASE)
    .sort(compareReleaseVersion)[0];
  return latest?.status === UserNotificationStatus.UNREAD ? latest : null;
}

export function isAndroidUpdateAvailable(release: ClientReleaseManifest | undefined, installed: InstalledAndroidVersion) {
  return Boolean(
    release
    && release.enabled
    && release.android.enabled
    && typeof installed.versionCode === 'number'
    && installed.versionCode > 0
    && release.android.versionCode > installed.versionCode
    && release.android.downloadUrl,
  );
}

export function androidReleaseNotification(release: ClientReleaseManifest): UserNotification {
  return {
    content: release.releaseNotes || release.summary,
    createdAt: release.publishedAt ?? new Date(0).toISOString(),
    id: `client-release:${release.android.versionCode}`,
    payload: {
      action: 'client-release',
      images: release.images ?? [],
      downloadUrl: release.android.downloadUrl,
      notificationId: release.noticeId,
      platform: 'android',
      versionCode: release.android.versionCode,
      versionName: release.versionName,
    },
    status: UserNotificationStatus.UNREAD,
    title: release.summary || `v${release.versionName}`,
    type: UserNotificationType.CLIENT_RELEASE,
    updatedAt: release.publishedAt ?? new Date(0).toISOString(),
    version: 1,
  };
}
