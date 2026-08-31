export interface AndroidReleaseManifest {
  platform: 'android';
  enabled: boolean;
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  releaseNotes: string;
  summary?: string;
  highlights?: AndroidReleaseHighlight[];
  updatedAt: string | null;
}

export interface AndroidReleaseHighlight {
  category: 'feature' | 'improvement' | 'fix';
  text: string;
}

export interface InstalledAndroidVersion {
  versionCode: number;
  versionName: string;
}

export function isAndroidUpdateAvailable(current: InstalledAndroidVersion, latest: AndroidReleaseManifest) {
  return latest.enabled && current.versionCode < latest.versionCode;
}

export function formatAndroidUpdateDescription(release: AndroidReleaseManifest, fallback: string) {
  const parts = [
    release.summary?.trim(),
    release.releaseNotes.trim(),
    ...(release.highlights ?? []).map(highlight => highlight.text.trim() ? `• ${highlight.text.trim()}` : ''),
  ].filter((part): part is string => Boolean(part));
  return parts.join('\n') || fallback;
}
