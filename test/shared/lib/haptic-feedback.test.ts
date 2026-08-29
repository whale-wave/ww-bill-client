import { beforeEach, describe, expect, it, vi } from 'vitest';

const isNativePlatform = vi.fn();
const impact = vi.fn();
const notification = vi.fn();

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: { impact, notification },
  ImpactStyle: { Light: 'LIGHT' },
  NotificationType: { Success: 'SUCCESS' },
}));

const { HapticFeedback } = await import('@/shared/lib/haptic-feedback');

describe('haptic feedback', () => {
  const vibrate = vi.fn();

  beforeEach(() => {
    isNativePlatform.mockReset();
    impact.mockReset();
    notification.mockReset();
    vibrate.mockReset();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });
  });

  it('does not emit feedback while disabled', () => {
    const feedback = new HapticFeedback();
    feedback.impact();
    feedback.success();

    expect(impact).not.toHaveBeenCalled();
    expect(notification).not.toHaveBeenCalled();
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('uses the browser vibration API outside a native shell', () => {
    isNativePlatform.mockReturnValue(false);
    const feedback = new HapticFeedback();
    feedback.open();
    feedback.impact();
    feedback.success();

    expect(vibrate).toHaveBeenNthCalledWith(1, 15);
    expect(vibrate).toHaveBeenNthCalledWith(2, [15, 35, 25]);
  });

  it('uses Capacitor haptics in a native shell', () => {
    isNativePlatform.mockReturnValue(true);
    impact.mockResolvedValue(undefined);
    notification.mockResolvedValue(undefined);
    const feedback = new HapticFeedback();
    feedback.open();
    feedback.impact();
    feedback.success();

    expect(impact).toHaveBeenCalledWith({ style: 'LIGHT' });
    expect(notification).toHaveBeenCalledWith({ type: 'SUCCESS' });
    expect(vibrate).not.toHaveBeenCalled();
  });
});
