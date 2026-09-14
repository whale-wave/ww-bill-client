import type { UserNotification } from '@/entities/notification';
import { UserNotificationStatus, UserNotificationType } from '@/entities/notification';

export type ReleasePromptPlatform = 'web' | 'android';

export interface InstalledReleaseVersion {
  versionCode?: number | null;
  versionName?: string | null;
}

interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: Array<number | string>;
}

const SEMVER_PATTERN = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function parseSemver(value: unknown): ParsedSemver | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = SEMVER_PATTERN.exec(value.trim());
  if (!match)
    return null;
  const prerelease = match[4]
    ? match[4].split('.').map(part => /^\d+$/.test(part) ? Number(part) : part)
    : [];
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease,
  };
}

function compareSemver(left: ParsedSemver, right: ParsedSemver) {
  for (const key of ['major', 'minor', 'patch'] as const) {
    if (left[key] !== right[key])
      return left[key] > right[key] ? 1 : -1;
  }
  if (!left.prerelease.length || !right.prerelease.length) {
    if (left.prerelease.length === right.prerelease.length)
      return 0;
    return left.prerelease.length ? -1 : 1;
  }
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left.prerelease[index];
    const rightPart = right.prerelease[index];
    if (leftPart === undefined)
      return -1;
    if (rightPart === undefined)
      return 1;
    if (leftPart === rightPart)
      continue;
    if (typeof leftPart === 'number' && typeof rightPart === 'string')
      return -1;
    if (typeof leftPart === 'string' && typeof rightPart === 'number')
      return 1;
    return leftPart > rightPart ? 1 : -1;
  }
  return 0;
}

function androidReleaseVersion(notification: UserNotification) {
  const value = notification.payload?.versionCode;
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function webReleaseVersion(notification: UserNotification) {
  return parseSemver(notification.payload?.versionName);
}

function hasReleaseVersion(notification: UserNotification, platform: ReleasePromptPlatform) {
  return platform === 'android'
    ? androidReleaseVersion(notification) !== null
    : webReleaseVersion(notification) !== null;
}

function compareReleaseVersion(
  left: UserNotification,
  right: UserNotification,
  platform: ReleasePromptPlatform,
) {
  if (platform === 'android') {
    const leftVersion = androidReleaseVersion(left);
    const rightVersion = androidReleaseVersion(right);
    return leftVersion === null || rightVersion === null ? 0 : leftVersion - rightVersion;
  }
  const leftVersion = webReleaseVersion(left);
  const rightVersion = webReleaseVersion(right);
  return leftVersion === null || rightVersion === null ? 0 : compareSemver(leftVersion, rightVersion);
}

function isNoticeNewerThanInstalled(
  notification: UserNotification,
  platform: ReleasePromptPlatform,
  installed: InstalledReleaseVersion,
) {
  if (platform === 'android') {
    const target = androidReleaseVersion(notification);
    return target !== null
      && typeof installed.versionCode === 'number'
      && Number.isSafeInteger(installed.versionCode)
      && target > installed.versionCode;
  }
  const target = webReleaseVersion(notification);
  if (target === null)
    return false;
  const current = parseSemver(installed.versionName);
  return current !== null && compareSemver(target, current) > 0;
}

/**
 * The notification center retains release history, but only its highest target
 * version is eligible to interrupt the user. Choosing before the unread check
 * also prevents an acknowledged newest notice from falling back to older ones.
 */
export function selectClientReleasePrompt(
  notifications: UserNotification[],
  platform: ReleasePromptPlatform,
  installed: InstalledReleaseVersion,
) {
  const releases = notifications
    .filter(item => item.type === UserNotificationType.CLIENT_RELEASE && hasReleaseVersion(item, platform))
    .sort((left, right) => {
      const versionComparison = compareReleaseVersion(right, left, platform);
      if (versionComparison)
        return versionComparison;
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        || right.id.localeCompare(left.id);
    });
  const latest = releases[0];
  if (!latest
    || latest.status !== UserNotificationStatus.UNREAD
    || latest.payload?.promptEnabled !== true
    || !isNoticeNewerThanInstalled(latest, platform, installed)) {
    return null;
  }
  return latest;
}
