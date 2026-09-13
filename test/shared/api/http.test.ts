import { beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/shared/api/http';

const showAppError = vi.hoisted(() => vi.fn());

vi.mock('@/shared/ui/app-feedback', () => ({
  showAppError,
}));

vi.mock('@/shared/monitoring', () => ({
  captureTransportError: vi.fn(),
}));

vi.mock('@sentry/capacitor', () => ({
  addBreadcrumb: vi.fn(),
}));

vi.mock('@/shared/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

describe('http response interceptor', () => {
  beforeEach(() => {
    showAppError.mockReset();
  });

  it('triggers showAppError for HTTP 400 Bad Request error responses', async () => {
    const errorResponse = {
      config: { method: 'POST', url: '/auth/login' },
      response: {
        status: 400,
        data: { statusCode: 400, message: '密码错误' },
      },
    };

    // Obtain response interceptor error handler
    const responseInterceptor = (request.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: unknown) => Promise<never> }>;
    }).handlers[0];

    await expect(responseInterceptor.rejected(errorResponse)).rejects.toThrow('密码错误');

    expect(showAppError).toHaveBeenCalledWith(
      expect.objectContaining({ message: '密码错误' }),
      expect.objectContaining({
        dedupeKey: 'http:400:密码错误',
        message: '密码错误',
      }),
    );
  });

  it('does not trigger showAppError when request config has silent: true', async () => {
    const errorResponse = {
      config: { method: 'POST', url: '/auth/presence', silent: true },
      response: {
        status: 400,
        data: { statusCode: 400, message: 'Bad request' },
      },
    };

    const responseInterceptor = (request.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: unknown) => Promise<never> }>;
    }).handlers[0];

    await expect(responseInterceptor.rejected(errorResponse)).rejects.toThrow('Bad request');

    expect(showAppError).not.toHaveBeenCalled();
  });
});
