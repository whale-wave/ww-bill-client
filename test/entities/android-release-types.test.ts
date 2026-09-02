import { describe, expect, it } from 'vitest';
import { formatAndroidUpdateDescription } from '@/entities/app-release';

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
