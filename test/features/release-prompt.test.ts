import type { ClientReleaseManifest } from '@/entities/app-release';
import { describe, expect, it } from 'vitest';
import { androidVersionUpdate, isAndroidUpdateAvailable, webVersionUpdate } from '@/features/app-update/model/release-prompt';

function release(overrides: Partial<ClientReleaseManifest> = {}): ClientReleaseManifest {
  return {
    android: { downloadUrl: 'https://example.com/bill.apk', enabled: false, versionCode: 11 },
    enabled: false,
    highlights: [],
    images: ['https://example.com/release.webp'],
    publishedAt: '2026-09-14T00:00:00.000Z',
    releaseNotes: '修复同步体验。',
    summary: 'v1.0.11 更新',
    versionName: '1.0.11',
    web: { buildId: '', enabled: false },
    ...overrides,
  };
}

describe('independent version detection', () => {
  it('uses the Android version code and HTTPS package URL even when legacy prompts are disabled', () => {
    const latest = release();
    expect(isAndroidUpdateAvailable(latest, 10)).toBe(true);
    expect(isAndroidUpdateAvailable(latest, 11)).toBe(false);
    expect(isAndroidUpdateAvailable(release({ android: { downloadUrl: 'http://example.com/bill.apk', enabled: true, versionCode: 11 } }), 10)).toBe(false);
    expect(androidVersionUpdate(latest)).toMatchObject({
      content: '修复同步体验。',
      downloadUrl: 'https://example.com/bill.apk',
      platform: 'android',
      versionName: '1.0.11',
    });
  });

  it('only attaches Web release notes when their version matches the deployed build', () => {
    const build = { buildId: 'sha-next', version: '1.0.12' };
    expect(webVersionUpdate(build, release())).toMatchObject({ buildId: 'sha-next', content: '', versionName: '1.0.12' });
    expect(webVersionUpdate(build, release({ versionName: '1.0.12' }))).toMatchObject({
      content: '修复同步体验。',
      title: 'v1.0.11 更新',
    });
    expect(webVersionUpdate(build).content).toBe('');
  });
});
