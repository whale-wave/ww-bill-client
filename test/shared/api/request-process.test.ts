import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAuthDeps } from '@/shared/api';
import { baseResponseProcess } from '@/shared/api/request-process';

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
    expect(window.location.hash).toBe('');
    vi.advanceTimersByTime(1000);
    expect(window.location.hash).toBe('');
  });

  it('clears the session without directly changing the hash when authentication is missing', () => {
    baseResponseProcess(401);

    expect(handleLogout).toHaveBeenCalledOnce();
    expect(window.location.hash).toBe('');
    vi.advanceTimersByTime(1000);
    expect(window.location.hash).toBe('');
  });

  it('does not trigger logout or return error message when user is already logged out', () => {
    const handleAuthFailureMock = vi.fn().mockReturnValue(false);
    setAuthDeps({
      handleAuthFailure: handleAuthFailureMock,
    });

    const result = baseResponseProcess(401);

    expect(handleAuthFailureMock).toHaveBeenCalledOnce();
    expect(result).toBeUndefined();
  });
});
