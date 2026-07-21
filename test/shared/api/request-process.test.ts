import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAuthDeps } from '@/shared/api';
import { baseResponseProcess } from '@/shared/api/request-process';

const { showToast } = vi.hoisted(() => ({
  showToast: vi.fn(),
}));

vi.mock('antd-mobile', () => ({
  Toast: { show: showToast },
}));

vi.mock('@/shared/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

describe('base response processing', () => {
  const handleLogout = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    handleLogout.mockReset();
    showToast.mockReset();
    window.location.hash = '';
    setAuthDeps({
      tokenGetter: () => 'token',
      logoutHandler: handleLogout,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the session when a request is forbidden', () => {
    baseResponseProcess(403);

    expect(handleLogout).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      content: 'common:api.forbidden',
      icon: 'fail',
    }));
    vi.advanceTimersByTime(1000);
    expect(window.location.hash).toBe('');
  });

  it('clears the session and redirects when authentication is missing', () => {
    baseResponseProcess(401);

    expect(handleLogout).toHaveBeenCalledOnce();
    expect(showToast).toHaveBeenCalledWith(expect.objectContaining({
      content: 'common:api.notLoggedIn',
      icon: 'fail',
    }));
    vi.advanceTimersByTime(1000);
    expect(window.location.hash).toBe('#/login');
  });
});
