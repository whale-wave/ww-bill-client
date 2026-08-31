export interface AndroidReleaseManifest {
  platform: 'android';
  enabled: boolean;
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  releaseNotes: string;
  updatedAt: string | null;
}

export interface InstalledAndroidVersion {
  versionCode: number;
  versionName: string;
}

export function isAndroidUpdateAvailable(current: InstalledAndroidVersion, latest: AndroidReleaseManifest) {
  return latest.enabled && current.versionCode < latest.versionCode;
}
