import type { HttpTransport, TransportRequest } from '../../miniapp/src/shared/api/transport';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../miniapp/src/shared/api/taro-transport', () => ({
  taroTransport: { send: vi.fn() },
}));

const { api, configureRequestContext, configureTransport } = await import('../../miniapp/src/shared/api/request');

const send = vi.fn<HttpTransport['send']>();
const onUnauthorized = vi.fn();
let activeToken = 'sample-token';

beforeEach(() => {
  vi.stubGlobal('BILL_API_BASE_URL', 'http://127.0.0.1:4301');
  send.mockReset();
  onUnauthorized.mockReset();
  activeToken = 'sample-token';
  configureTransport({ send });
  configureRequestContext({ getToken: () => activeToken, onUnauthorized });
});

describe('miniapp request boundary', () => {
  it('builds authenticated requests with classification version and query parameters', async () => {
    send.mockResolvedValue({ statusCode: 200, data: { statusCode: 200, data: { total: 0 } } });

    await expect(api.get<{ total: number }>('/record', {
      query: { startDate: '2026-09-01', offset: 0, keyword: '餐 饮' },
    })).resolves.toEqual({ total: 0 });

    const request = send.mock.calls[0][0] as TransportRequest;
    expect(request.url).toBe('http://127.0.0.1:4301/api/record?startDate=2026-09-01&offset=0&keyword=%E9%A4%90%20%E9%A5%AE');
    expect(request.headers.Authorization).toBe('Bearer sample-token');
    expect(request.headers['X-Classification-Version']).toBe('2');
  });

  it('rejects a business failure even when HTTP succeeds', async () => {
    send.mockResolvedValue({ statusCode: 200, data: { statusCode: 426, message: '分类版本过低' } });
    await expect(api.get('/category')).rejects.toMatchObject({ kind: 'business', statusCode: 426, message: '分类版本过低' });
  });

  it('handles unauthorized responses without clearing a newer session', async () => {
    send.mockImplementation(async () => {
      activeToken = 'new-session-token';
      return { statusCode: 401, data: { statusCode: 401, message: '登录失效' } };
    });
    await expect(api.get('/user/userInfo')).rejects.toMatchObject({ kind: 'http', statusCode: 401 });
    expect(onUnauthorized).toHaveBeenCalledWith('sample-token');
  });

  it('normalizes network errors for page feedback', async () => {
    send.mockRejectedValue(new Error('request:fail'));
    await expect(api.get('/chart/dashboard')).rejects.toMatchObject({ kind: 'network', statusCode: 0 });
  });
});
