import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildTransportContext, requestUrl } from '@/shared/monitoring/transport-context';

afterEach(() => {
  vi.restoreAllMocks();
  window.location.hash = '';
});

describe('transport diagnostics', () => {
  it.each([
    ['/api', '/users', 'http://localhost/api/users'],
    ['https://bill.example/api', '/users', 'https://bill.example/api/users'],
    ['https://bill.example/api/', 'users', 'https://bill.example/api/users'],
    ['/api', 'https://other.example/users', 'https://other.example/users'],
  ])('uses Axios joining rules for %s and %s', (baseURL, url, expected) => {
    expect(requestUrl({ baseURL, url }).url).toBe(expected);
  });

  it('excludes credentials, fragments, query strings and never invokes params serializers', () => {
    const serialize = vi.fn(() => 'token=secret');
    expect(requestUrl({
      url: 'https://user:password@bill.example/api/users?token=secret#secret',
      params: { remark: 'private', token: 'secret' },
      paramsSerializer: { serialize },
    })).toEqual({ url: 'https://bill.example/api/users', path: '/api/users' });
    expect(serialize).not.toHaveBeenCalled();
  });

  it('records elapsed time, XHR state and the actual Hash route without route parameters', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1500);
    window.location.hash = '#/records?token=private';
    const context = buildTransportContext({
      config: { baseURL: '/api', url: '/record', method: 'post', timeout: 50000, monitoringStartedAt: 1000 },
      code: 'ERR_NETWORK',
      request: { status: 0, readyState: 4 },
    }, 'network');
    expect(context).toMatchObject({
      method: 'POST',
      url: 'http://localhost/api/record',
      path: '/api/record',
      kind: 'network',
      errorCode: 'ERR_NETWORK',
      durationMs: 500,
      timeoutMs: 50000,
      xhrStatus: 0,
      readyState: 4,
      route: '/records',
      online: true,
    });
    expect(JSON.stringify(context)).not.toContain('private');
  });

  it('tolerates missing config and browser connection information', () => {
    expect(buildTransportContext({}, 'timeout')).toMatchObject({ kind: 'timeout', method: 'GET' });
    expect(buildTransportContext({}, 'timeout').durationMs).toBeUndefined();
  });
});

it('redacts invitation capabilities from API paths and Hash routes', () => {
  window.location.hash = '#/ledger-invites/secret-capability';
  const context = buildTransportContext({ config: { baseURL: '/api', url: '/ledger-invitations/secret-capability/join-requests' } }, 'network');
  expect(context.path).toBe('/api/ledger-invitations/[redacted]/join-requests');
  expect(context.route).toBe('/ledger-invites/[redacted]');
  expect(JSON.stringify(context)).not.toContain('secret-capability');
});
