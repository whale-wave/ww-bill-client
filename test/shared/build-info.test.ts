import { describe, expect, it, vi } from 'vitest';
import {
  buildRefreshUrl,
  fetchBuildInfo,
  isNewerBuild,
  refreshBeforeAppStart,
} from '@/shared/config/build-info';

const buildInfoResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('web build update metadata', () => {
  it('fetches the deployment manifest without using the browser cache', async () => {
    const fetcher = vi.fn().mockResolvedValue(buildInfoResponse({ buildId: 'sha-new', version: '1.0.5' }));

    await expect(fetchBuildInfo(fetcher as typeof fetch)).resolves.toEqual({ buildId: 'sha-new', version: '1.0.5' });
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringMatching(/^\/build-info\.json\?ww-check=\d+$/),
      expect.objectContaining({ cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }),
    );
  });

  it('rejects unavailable or malformed manifests without accepting an unsafe update', async () => {
    await expect(fetchBuildInfo(vi.fn().mockResolvedValue(buildInfoResponse({}, 200)) as typeof fetch)).rejects.toThrow('Invalid build info response');
    await expect(fetchBuildInfo(vi.fn().mockResolvedValue(buildInfoResponse({}, 503)) as typeof fetch)).rejects.toThrow('Unable to fetch build info: 503');
  });

  it('only treats a distinct immutable build identifier as an update', () => {
    expect(isNewerBuild('sha-current', { buildId: 'sha-current', version: '1.0.5' })).toBe(false);
    expect(isNewerBuild('sha-current', { buildId: 'sha-next', version: '1.0.5' })).toBe(true);
    expect(isNewerBuild('sha-current', null)).toBe(false);
  });

  it('adds the target build marker while retaining the current route', () => {
    expect(buildRefreshUrl('https://abill.easyhappy.top/settings/about?from=mine', 'sha-next')).toBe(
      'https://abill.easyhappy.top/settings/about?from=mine&ww-build=sha-next',
    );
  });

  it('silently refreshes before app startup only when a newer build is available', async () => {
    const replace = vi.fn();
    const location = { href: 'https://abill.easyhappy.top/', replace };
    const fetcher = vi.fn().mockResolvedValue(buildInfoResponse({ buildId: 'sha-next', version: '1.0.5' }));

    await expect(refreshBeforeAppStart({ currentBuildId: 'sha-current', fetcher: fetcher as typeof fetch, location })).resolves.toBe(true);
    expect(replace).toHaveBeenCalledWith('https://abill.easyhappy.top/?ww-build=sha-next');

    replace.mockClear();
    fetcher.mockResolvedValue(buildInfoResponse({ buildId: 'sha-current', version: '1.0.5' }));
    await expect(refreshBeforeAppStart({ currentBuildId: 'sha-current', fetcher: fetcher as typeof fetch, location })).resolves.toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });
});
