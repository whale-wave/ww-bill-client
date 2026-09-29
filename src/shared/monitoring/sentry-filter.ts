import type { Breadcrumb } from '@sentry/capacitor';
import type { ErrorEvent } from '@sentry/react';
import { buildDeviceContext } from './device-context';

const sensitiveKeyPattern = /authorization|cookie|token|password|secret|code|email|phone|remark|ledger|household|attachment|image/i;

export function scrubMonitoringUrl(value: string) {
  return value.split(/[?#]/)[0]
    .replace(/^(https?:\/\/)[^/@]+@/, '$1')
    .replace(/(\/(?:household-invitations|ledger-invitations|ledger-invites)\/)[^/]+/g, '$1[redacted]');
}

function scrubText(value: string) {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b(?:\+?86[- ]?)?1[3-9]\d{9}\b/g, '[redacted-phone]')
    .replace(/Bearer\s+[\w.-]+/gi, 'Bearer [redacted]');
}

export function beforeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console')
    return null;
  return {
    ...breadcrumb,
    message: breadcrumb.message ? scrubText(breadcrumb.message) : breadcrumb.message,
    data: breadcrumb.data
      ? {
          method: breadcrumb.data.method,
          status_code: breadcrumb.data.status_code,
          error_kind: breadcrumb.data.error_kind,
          error_code: breadcrumb.data.error_code,
          duration_ms: breadcrumb.data.duration_ms,
          url: typeof breadcrumb.data.url === 'string' ? scrubMonitoringUrl(breadcrumb.data.url).replace(/^https?:\/\/[^/]+/, '') : undefined,
        }
      : undefined,
  };
}

export function beforeSend(event: ErrorEvent): ErrorEvent {
  const deviceContext = buildDeviceContext();
  if (event.message)
    event.message = scrubText(event.message);
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map(exception => ({
      ...exception,
      value: exception.value ? scrubText(exception.value) : exception.value,
    }));
  }
  if (event.request) {
    event.request = {
      ...event.request,
      data: undefined,
      query_string: undefined,
      cookies: undefined,
      headers: { 'User-Agent': deviceContext.user_agent },
      url: event.request.url ? scrubMonitoringUrl(event.request.url) : undefined,
    };
  }
  if (event.user)
    event.user = { id: event.user.id };
  if (event.extra) {
    event.extra = Object.fromEntries(
      Object.entries(event.extra).filter(([key]) => !sensitiveKeyPattern.test(key)),
    );
  }
  if (event.contexts) {
    event.contexts = Object.fromEntries(
      Object.entries(event.contexts).filter(([key]) => !sensitiveKeyPattern.test(key)),
    );
  }
  event.contexts = { ...event.contexts, client_device: deviceContext };
  // Preserve native model/OS enrichment without uploading device names or IDs.
  if (event.contexts.device) {
    event.contexts.device = Object.fromEntries(
      Object.entries(event.contexts.device).filter(([key]) => !['id', 'name', 'serial_number'].includes(key)),
    );
  }
  const deviceTags = {
    device_model: event.contexts.device?.model,
    device_brand: event.contexts.device?.brand,
    os_name: event.contexts.os?.name,
    os_version: event.contexts.os?.version,
  };
  event.tags = { ...event.tags, platform: deviceContext.platform };
  for (const [key, value] of Object.entries(deviceTags)) {
    if (typeof value === 'string' && value)
      event.tags[key] = value;
  }
  return event;
}
