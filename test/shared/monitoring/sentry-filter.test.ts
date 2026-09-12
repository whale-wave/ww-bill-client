import { describe, expect, it } from 'vitest';
import { beforeBreadcrumb, beforeSend } from '@/shared/monitoring/sentry-filter';

describe('sentry privacy filters', () => {
  it('removes request credentials and accounting payloads', () => {
    const event = beforeSend({
      event_id: 'event-1',
      type: undefined,
      message: 'failed for test@example.com 13800138000',
      request: {
        url: 'https://bill.example/api/record?token=secret',
        headers: { Authorization: 'Bearer abc', Cookie: 'session=secret' },
        data: { remark: '医院消费', amount: '20' },
        query_string: 'token=secret',
      },
      user: { id: 'user-1', email: 'test@example.com' },
      extra: { remark: '医院消费', safe: 'ok' },
    });

    expect(event.message).toContain('[redacted-email]');
    expect(event.message).toContain('[redacted-phone]');
    expect(event.request?.headers).toBeUndefined();
    expect(event.request?.data).toBeUndefined();
    expect(event.request?.query_string).toBeUndefined();
    expect(event.request?.url).toBe('https://bill.example/api/record');
    expect(event.user).toEqual({ id: 'user-1' });
    expect(event.extra).toEqual({ safe: 'ok' });
  });

  it('drops console breadcrumbs and strips URL query strings', () => {
    expect(beforeBreadcrumb({ category: 'console', message: 'secret' })).toBeNull();
    expect(beforeBreadcrumb({ category: 'http', data: { url: '/api/record?remark=secret', method: 'POST', status_code: 500 } })).toMatchObject({
      data: { url: '/api/record', method: 'POST', status_code: 500 },
    });
  });
});
