import { describe, expect, it } from 'vitest';
import { isIosBrowser } from '@/pages/settings/model/ios-home-screen-guide';

const browser = {
  displayModeStandalone: false,
  maxTouchPoints: 0,
  nativePlatform: false,
};

describe('iOS Home Screen guide availability', () => {
  it('shows the guide in iPhone and iPad browsers, including iPadOS desktop mode', () => {
    expect(isIosBrowser({
      ...browser,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    })).toBe(true);
    expect(isIosBrowser({
      ...browser,
      maxTouchPoints: 5,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    })).toBe(true);
  });

  it('hides the guide outside a regular iOS browser', () => {
    expect(isIosBrowser({
      ...browser,
      userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9)',
    })).toBe(false);
    expect(isIosBrowser({
      ...browser,
      displayModeStandalone: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    })).toBe(false);
    expect(isIosBrowser({
      ...browser,
      nativePlatform: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    })).toBe(false);
  });
});
