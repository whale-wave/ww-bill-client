import { AxiosError, CanceledError } from 'axios';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from '@/shared/api/http';

const showAppError = vi.hoisted(() => vi.fn());
const captureTransportError = vi.hoisted(() => vi.fn());

vi.mock('@/shared/ui/app-feedback', () => ({
  showAppError,
}));

vi.mock('@/shared/monitoring', () => ({
  captureTransportError,
}));

vi.mock('@sentry/capacitor', () => ({
  addBreadcrumb: vi.fn(),
}));

vi.mock('@/shared/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

beforeEach(() => {
  showAppError.mockReset();
  captureTransportError.mockReset();
  vi.restoreAllMocks();
});

describe('http response interceptor', () => {
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

describe('hTTP transport monitoring', () => {
  it.each(['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'])('reports %s with actual request timing and URL', async (code) => {
    const error = new AxiosError(code === 'ERR_NETWORK' ? 'Network Error' : 'timeout', code, undefined, { status: 0, readyState: 4 });
    await expect(request.get('/record?token=private', {
      silent: true,
      adapter: async (config) => {
        error.config = config;
        throw error;
      },
    })).rejects.toMatchObject({ kind: code === 'ERR_NETWORK' ? 'network' : 'timeout' });
    expect(captureTransportError).toHaveBeenCalledWith(error, expect.objectContaining({
      kind: code === 'ERR_NETWORK' ? 'network' : 'timeout',
      url: 'http://localhost/api/record',
      method: 'GET',
      errorCode: code,
      timeoutMs: 50000,
      durationMs: expect.any(Number),
      xhrStatus: 0,
    }));
    expect(showAppError).not.toHaveBeenCalled();
  });

  it('does not send known offline failures to Sentry', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    await expect(request.get('/record', { silent: true, adapter: async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    } })).rejects.toMatchObject({ kind: 'network' });
    expect(captureTransportError).not.toHaveBeenCalled();
  });

  it('does not report explicit request cancellation as a network incident', async () => {
    await expect(request.get('/record', { silent: true, adapter: async (config) => {
      const error = new CanceledError('canceled');
      error.config = config;
      throw error;
    } })).rejects.toBeDefined();
    expect(captureTransportError).not.toHaveBeenCalled();
  });
});
