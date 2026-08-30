export interface BuildInfo {
  buildId: string;
  version: string;
}

export interface BrowserLocation {
  href: string;
  replace: (url: string) => void;
}

function isBuildInfo(value: unknown): value is BuildInfo {
  if (typeof value !== 'object' || value === null)
    return false;
  const candidate = value as Partial<BuildInfo>;
  return typeof candidate.buildId === 'string'
    && candidate.buildId.trim().length > 0
    && typeof candidate.version === 'string'
    && candidate.version.trim().length > 0;
}

export async function fetchBuildInfo(fetcher: typeof fetch = fetch, signal?: AbortSignal): Promise<BuildInfo> {
  const response = await fetcher(`/build-info.json?ww-check=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
    signal,
  });
  if (!response.ok)
    throw new Error(`Unable to fetch build info: ${response.status}`);
  const value: unknown = await response.json();
  if (!isBuildInfo(value))
    throw new Error('Invalid build info response');
  return value;
}

export function isNewerBuild(currentBuildId: string, latest: BuildInfo | null | undefined) {
  return Boolean(latest && currentBuildId !== latest.buildId);
}

export function buildRefreshUrl(href: string, buildId: string) {
  const url = new URL(href);
  url.searchParams.set('ww-build', buildId);
  return url.toString();
}

export function refreshForBuild(location: BrowserLocation, buildId: string) {
  location.replace(buildRefreshUrl(location.href, buildId));
}

export async function refreshBeforeAppStart(options: {
  currentBuildId: string;
  fetcher?: typeof fetch;
  location: BrowserLocation;
  timeoutMs?: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 2_500);
  try {
    const latest = await fetchBuildInfo(options.fetcher, controller.signal);
    if (!isNewerBuild(options.currentBuildId, latest))
      return false;
    refreshForBuild(options.location, latest.buildId);
    return true;
  }
  finally {
    clearTimeout(timeout);
  }
}
