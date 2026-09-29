import type { ClientReleaseManifest } from '@/entities/app-release';
import type { BuildInfo } from '@/shared/config/build-info';

export interface VersionUpdate {
  platform: 'web' | 'android';
  versionName: string;
  title: string;
  content: string;
  images: string[];
  buildId?: string;
  downloadUrl?: string;
}

export function isAndroidUpdateAvailable(release: ClientReleaseManifest | undefined, installedVersionCode: number | null) {
  return Boolean(
    release
    && typeof installedVersionCode === 'number'
    && installedVersionCode > 0
    && release.android.versionCode > installedVersionCode
    && /^https:\/\//i.test(release.android.downloadUrl),
  );
}

export function androidVersionUpdate(release: ClientReleaseManifest): VersionUpdate {
  return {
    platform: 'android',
    versionName: release.versionName,
    title: release.summary,
    content: release.releaseNotes,
    images: release.images ?? [],
    downloadUrl: release.android.downloadUrl,
  };
}

export function webVersionUpdate(build: BuildInfo, release?: ClientReleaseManifest): VersionUpdate {
  const matchingRelease = release?.versionName === build.version ? release : undefined;
  return {
    platform: 'web',
    versionName: build.version,
    title: matchingRelease?.summary ?? '',
    content: matchingRelease?.releaseNotes ?? '',
    images: matchingRelease?.images ?? [],
    buildId: build.buildId,
  };
}
