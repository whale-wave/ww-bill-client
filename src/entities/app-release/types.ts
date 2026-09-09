export interface AndroidReleaseManifest {
  platform: 'android';
  enabled: boolean;
  versionCode: number;
  versionName: string;
  downloadUrl: string;
  releaseNotes: string;
  summary?: string;
  highlights?: ClientReleaseHighlight[];
  updatedAt: string | null;
}

export interface ClientReleaseManifest {
  enabled: boolean;
  versionName: string;
  summary: string;
  releaseNotes: string;
  highlights: ClientReleaseHighlight[];
  web: {
    enabled: boolean;
    buildId: string;
  };
  android: {
    enabled: boolean;
    versionCode: number;
    downloadUrl: string;
  };
  publishedAt: string | null;
}

export interface ClientReleaseHighlight {
  category: 'feature' | 'improvement' | 'fix';
  text: string;
}

export type AndroidReleaseHighlight = ClientReleaseHighlight;

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

export function formatClientReleaseDescription(release: ClientReleaseManifest, fallback: string) {
  const parts = [
    release.summary.trim(),
    release.releaseNotes.trim(),
    ...release.highlights.map(highlight => highlight.text.trim() ? `• ${highlight.text.trim()}` : ''),
  ].filter((part): part is string => Boolean(part));
  return parts.join('\n') || fallback;
}

export function isAndroidClientUpdateAvailable(current: InstalledAndroidVersion, release: ClientReleaseManifest) {
  return release.enabled && release.android.enabled && current.versionCode < release.android.versionCode;
}

export function isWebClientUpdateAvailable(currentBuildId: string, deployedBuildId: string, release: ClientReleaseManifest) {
  return release.enabled
    && release.web.enabled
    && Boolean(release.web.buildId)
    && currentBuildId !== release.web.buildId
    && deployedBuildId === release.web.buildId;
}

export function isCurrentWebRelease(currentBuildId: string, release: ClientReleaseManifest) {
  return release.enabled && release.web.enabled && currentBuildId === release.web.buildId;
}
