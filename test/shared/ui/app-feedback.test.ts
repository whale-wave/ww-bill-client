import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showAppError, showAppNotice } from '@/shared/ui/app-feedback';

const { toastShow, toastClear } = vi.hoisted(() => ({
  toastClear: vi.fn(),
  toastShow: vi.fn(),
}));

vi.mock('antd-mobile', () => ({
  Toast: { clear: toastClear, show: toastShow },
}));

vi.mock('@/shared/i18n', () => ({
  i18n: { t: () => 'request failed' },
}));

describe('app feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    toastClear.mockReset();
    toastShow.mockReset();
  });

  it('shows the same error object only once', () => {
    const error = new Error('save failed');
    showAppError(error);
    showAppError(error);

    expect(toastShow).toHaveBeenCalledOnce();
    expect(toastShow).toHaveBeenCalledWith(expect.objectContaining({
      content: 'save failed',
      duration: 1800,
      icon: 'fail',
    }));
  });

  it('deduplicates an explicit transport key only inside its short window', () => {
    showAppError(undefined, { dedupeKey: 'transport:network', message: 'offline' });
    showAppError(undefined, { dedupeKey: 'transport:network', message: 'offline' });
    expect(toastShow).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(1000);
    showAppError(undefined, { dedupeKey: 'transport:network', message: 'offline' });
    expect(toastShow).toHaveBeenCalledTimes(2);
  });

  it('renders notices without an icon and with a non-blocking mask', () => {
    showAppNotice('consent required');

    expect(toastShow).toHaveBeenCalledWith(expect.objectContaining({
      content: 'consent required',
      duration: 1500,
      icon: undefined,
      maskStyle: { pointerEvents: 'none' },
    }));
  });
});
