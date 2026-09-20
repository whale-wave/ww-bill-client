import { describe, expect, it } from 'vitest';
import { getIosShortcutInstallUrl, getShortcutTokenRetryAt } from '@/pages/shortcut-bookkeeping-settings/model';

describe('shortcut bookkeeping settings model', () => {
  it('accepts only an HTTPS iCloud Shortcut sharing URL', () => {
    expect(getIosShortcutInstallUrl('https://www.icloud.com/shortcuts/abc123'))
      .toBe('https://www.icloud.com/shortcuts/abc123');
    expect(getIosShortcutInstallUrl('http://www.icloud.com/shortcuts/abc123')).toBeUndefined();
    expect(getIosShortcutInstallUrl('https://example.com/shortcuts/abc123')).toBeUndefined();
    expect(getIosShortcutInstallUrl('https://www.icloud.com/drive/abc123')).toBeUndefined();
    expect(getIosShortcutInstallUrl(undefined)).toBeUndefined();
  });

  it('rounds a valid retry time up to a whole second for display', () => {
    const now = Date.parse('2026-08-29T10:00:00.000Z');
    expect(getShortcutTokenRetryAt({ retryAt: '2026-08-29T10:10:00.500Z' }, now))
      .toEqual(new Date('2026-08-29T10:10:01.000Z'));
    expect(getShortcutTokenRetryAt({ retryAt: '2026-08-29T09:59:59.000Z' }, now))
      .toBeUndefined();
    expect(getShortcutTokenRetryAt({ retryAt: 'not-a-date' }, now))
      .toBeUndefined();
    expect(getShortcutTokenRetryAt({}, now)).toBeUndefined();
  });
});
