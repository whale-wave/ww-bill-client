import type { Breadcrumb } from '@sentry/capacitor';
import type { ErrorEvent } from '@sentry/react';

const sensitiveKeyPattern = /authorization|cookie|token|password|secret|code|email|phone|remark|ledger|household|attachment|image/i;

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
          url: typeof breadcrumb.data.url === 'string' ? breadcrumb.data.url.split('?')[0].replace(/^https?:\/\/[^/]+/, '') : undefined,
        }
      : undefined,
  };
}

export function beforeSend(event: ErrorEvent): ErrorEvent {
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
      headers: undefined,
      url: event.request.url?.split('?')[0],
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
  return event;
}
