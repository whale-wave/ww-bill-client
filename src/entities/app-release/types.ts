export interface AndroidReleaseManifest {
  platform: 'android';
  enabled: boolean;
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  releaseNotes: string;
  summary?: string;
  highlights?: AndroidReleaseHighlight[];
  publishedAt?: string | null;
  updatedAt: string | null;
}

export type AndroidReleaseHighlightCategory = 'feature' | 'improvement' | 'fix';
export interface AndroidReleaseHighlight { category: AndroidReleaseHighlightCategory; text: string }

export interface InstalledAndroidVersion {
  versionCode: number;
  versionName: string;
}

export function isAndroidUpdateAvailable(current: InstalledAndroidVersion, latest: AndroidReleaseManifest) {
  return latest.enabled && current.versionCode < latest.versionCode;
}
