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
    expect(event.request?.headers).toEqual({ 'User-Agent': navigator.userAgent });
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

it('retains transport diagnostics while dropping private breadcrumb data', () => {
  const breadcrumb = beforeBreadcrumb({ category: 'http', data: {
    url: '/api/record?token=private',
    method: 'POST',
    status_code: 0,
    error_kind: 'network',
    error_code: 'ERR_NETWORK',
    duration_ms: 800,
    headers: { Authorization: 'Bearer private' },
    data: { remark: 'private' },
  } });
  expect(breadcrumb?.data).toEqual({
    url: '/api/record',
    method: 'POST',
    status_code: 0,
    error_kind: 'network',
    error_code: 'ERR_NETWORK',
    duration_ms: 800,
  });
  expect(JSON.stringify(breadcrumb)).not.toContain('private');
});

it('preserves native device and OS context with searchable model and OS tags', () => {
  const event = beforeSend({
    type: undefined,
    contexts: {
      device: { model: 'Pixel 9', brand: 'Google', name: 'Personal phone', id: 'private-id', serial_number: 'private-serial' },
      os: { name: 'Android', version: '16' },
    },
    tags: { build_id: 'test-build' },
  });
  expect(event.contexts?.device).toEqual({ model: 'Pixel 9', brand: 'Google' });
  expect(event.contexts?.os).toEqual({ name: 'Android', version: '16' });
  expect(event.tags).toMatchObject({
    build_id: 'test-build',
    platform: 'web',
    device_model: 'Pixel 9',
    device_brand: 'Google',
    os_name: 'Android',
    os_version: '16',
  });
  expect(JSON.stringify(event)).not.toContain('private-id');
  expect(JSON.stringify(event)).not.toContain('Personal phone');
});

it('adds device diagnostics to events without request or native contexts', () => {
  const event = beforeSend({ type: undefined });
  expect(event.contexts?.client_device).toMatchObject({
    platform: 'web',
    user_agent: navigator.userAgent,
    language: navigator.language,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    pixel_ratio: window.devicePixelRatio,
  });
  expect(event.tags).toMatchObject({ platform: 'web' });
  expect(event.tags?.device_model).toBeUndefined();
});
