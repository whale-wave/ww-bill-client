import { describe, expect, it } from 'vitest';
import {
  formatAndroidUpdateDescription,
  formatClientReleaseDescription,
  isAndroidClientUpdateAvailable,
  isCurrentWebRelease,
  isWebClientUpdateAvailable,
} from '@/entities/app-release';

describe('formatAndroidUpdateDescription', () => {
  it('includes the configured summary, notes, and highlights', () => {
    expect(formatAndroidUpdateDescription({
      downloadUrl: 'https://example.com/ww-bill-1.0.3.apk',
      enabled: true,
      highlights: [
        { category: 'feature', text: '支持快捷记账' },
        { category: 'fix', text: '修复启动失败' },
      ],
      platform: 'android',
      releaseNotes: '建议尽快更新',
      summary: '快捷记账正式上线',
      updatedAt: null,
      versionCode: 3,
      versionName: '1.0.3',
    }, '发现新版本')).toBe('快捷记账正式上线\n建议尽快更新\n• 支持快捷记账\n• 修复启动失败');
  });
});

describe('unified client release', () => {
  const release = {
    enabled: true,
    versionName: '1.0.10',
    summary: '统一版本公告',
    releaseNotes: '建议更新',
    highlights: [{ category: 'feature' as const, text: 'Web 和 Android 共用说明' }],
    web: { enabled: true, buildId: 'sha-next' },
    android: {
      enabled: true,
      versionCode: 10,
      downloadUrl: 'https://example.com/ww-bill-1.0.10.apk',
    },
    publishedAt: '2026-09-09T00:00:00.000Z',
  };

  it('uses one announcement body for every enabled target', () => {
    expect(formatClientReleaseDescription(release, '发现新版本')).toBe(
      '统一版本公告\n建议更新\n• Web 和 Android 共用说明',
    );
  });

  it('compares the platform-specific immutable version identifiers', () => {
    expect(isAndroidClientUpdateAvailable({ versionCode: 9, versionName: '1.0.9' }, release)).toBe(true);
    expect(isAndroidClientUpdateAvailable({ versionCode: 10, versionName: '1.0.10' }, release)).toBe(false);
    expect(isWebClientUpdateAvailable('sha-current', 'sha-next', release)).toBe(true);
    expect(isWebClientUpdateAvailable('sha-current', 'sha-newer', release)).toBe(false);
    expect(isWebClientUpdateAvailable('sha-next', 'sha-next', release)).toBe(false);
    expect(isCurrentWebRelease('sha-next', release)).toBe(true);
  });
});
