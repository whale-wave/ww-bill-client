import { describe, expect, it } from 'vitest';
import { isDevToolEnabled } from '@/shared/config/dev-tools';

describe('development tools', () => {
  it('keeps floating development tools disabled unless explicitly enabled', () => {
    expect(isDevToolEnabled({ isDev: true })).toBe(false);
    expect(isDevToolEnabled({ enabledFlag: 'false', isDev: true })).toBe(false);
    expect(isDevToolEnabled({ enabledFlag: 'true', isDev: false })).toBe(false);
    expect(isDevToolEnabled({ enabledFlag: 'true', isDev: true })).toBe(true);
  });
});
