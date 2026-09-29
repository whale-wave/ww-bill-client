import { afterEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  browserTracingIntegration: vi.fn(),
}));
const scope = vi.hoisted(() => ({ setTag: vi.fn(), setContext: vi.fn() }));
vi.mock('@sentry/capacitor', () => ({
  ...sdk,
  withScope: (callback: (value: typeof scope) => void) => callback(scope),
}));
vi.mock('@sentry/react', () => ({ init: vi.fn() }));
vi.mock('@/shared/config/app-info', () => ({ APP_INFO: { version: '1.0.10', buildId: 'test-build' } }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.resetModules();
});

describe('sentry transport reporting', () => {
  it('attaches diagnostics and a failed request breadcrumb before capturing the original error', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@example.com/1');
    const { captureTransportError } = await import('@/shared/monitoring/sentry');
    const error = new Error('Network Error');
    captureTransportError(error, {
      kind: 'network',
      method: 'POST',
      url: 'https://bill.example/api/record',
      path: '/api/record',
      errorCode: 'ERR_NETWORK',
      durationMs: 700,
      timeoutMs: 50000,
      xhrStatus: 0,
      readyState: 4,
      route: '/record/bookkeeping',
      online: true,
      visibility: 'hidden',
      effectiveType: '4g',
      serviceWorkerControlled: true,
    });
    expect(scope.setTag).toHaveBeenCalledWith('axios_error_code', 'ERR_NETWORK');
    expect(scope.setContext).toHaveBeenCalledWith('http', expect.objectContaining({
      url: 'https://bill.example/api/record',
      duration_ms: 700,
      timeout_ms: 50000,
      status_code: 0,
    }));
    expect(scope.setContext).toHaveBeenCalledWith('client_state', {
      route: '/record/bookkeeping',
      visibility: 'hidden',
      service_worker_controlled: true,
    });
    expect(scope.setContext).toHaveBeenCalledWith('network', expect.objectContaining({ online: true, effective_type: '4g' }));
    expect(sdk.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ url: '/api/record', error_kind: 'network', error_code: 'ERR_NETWORK', duration_ms: 700 }),
    }));
    expect(sdk.addBreadcrumb.mock.invocationCallOrder[0]).toBeLessThan(sdk.captureException.mock.invocationCallOrder[0]);
    expect(sdk.captureException).toHaveBeenCalledWith(error);
  });
});
