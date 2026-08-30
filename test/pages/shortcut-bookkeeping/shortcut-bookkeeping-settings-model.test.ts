import { describe, expect, it } from 'vitest';
import { getIosShortcutInstallUrl } from '@/pages/shortcut-bookkeeping-settings/model';

describe('shortcut bookkeeping settings model', () => {
  it('accepts only an HTTPS iCloud Shortcut sharing URL', () => {
    expect(getIosShortcutInstallUrl('https://www.icloud.com/shortcuts/abc123'))
      .toBe('https://www.icloud.com/shortcuts/abc123');
    expect(getIosShortcutInstallUrl('http://www.icloud.com/shortcuts/abc123')).toBeUndefined();
    expect(getIosShortcutInstallUrl('https://example.com/shortcuts/abc123')).toBeUndefined();
    expect(getIosShortcutInstallUrl('https://www.icloud.com/drive/abc123')).toBeUndefined();
    expect(getIosShortcutInstallUrl(undefined)).toBeUndefined();
  });
});
