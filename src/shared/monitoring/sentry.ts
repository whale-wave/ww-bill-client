import { Capacitor } from '@capacitor/core';
import * as Sentry from '@sentry/capacitor';
import * as SentryReact from '@sentry/react';
import { APP_INFO } from '@/shared/config/app-info';
import { beforeBreadcrumb, beforeSend } from './sentry-filter';

const isProduction = import.meta.env.PROD;
const dsn = import.meta.env.VITE_SENTRY_DSN;
const enabled = isProduction && typeof dsn === 'string' && dsn.length > 0;
const buildId = APP_INFO.buildId;
const release = `ww-bill-client@${APP_INFO.version}+${buildId.slice(0, 12)}`;

function sampleRate(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const apiOrigin = typeof import.meta.env.VITE_HOST === 'string' ? import.meta.env.VITE_HOST : '';
const tracePropagationTargets: Array<string | RegExp> = [/^\/api(?:\/|$)/];
if (apiOrigin) {
  try {
    tracePropagationTargets.push(new RegExp(`^${escapeRegExp(new URL(apiOrigin).origin)}/api(?:/|$)`));
  }
  catch {
    // Invalid development hosts are rejected by the existing app configuration.
  }
}

if (enabled) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    release,
    dist: buildId,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: sampleRate(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE, 0.05),
    tracePropagationTargets,
    sendDefaultPii: false,
    beforeSend,
    beforeBreadcrumb,
  }, SentryReact.init);
  Sentry.setTag('platform', Capacitor.getPlatform());
  Sentry.setTag('app_version', APP_INFO.version);
  Sentry.setTag('build_id', APP_INFO.buildId);
  Sentry.setContext('app', { version: APP_INFO.version, build_id: APP_INFO.buildId });
}

export function setMonitoringUser(userId?: string | number) {
  if (!enabled)
    return;
  Sentry.setUser(userId === undefined ? null : { id: String(userId) });
}

export function clearMonitoringUser() {
  setMonitoringUser(undefined);
}

export function captureTransportError(error: unknown, context: { method?: string; url?: string; statusCode?: number }) {
  if (!enabled)
    return;
  Sentry.withScope((scope) => {
    scope.setTag('monitoring_kind', 'transport');
    scope.setContext('http', {
      method: context.method,
      url: context.url?.split('?')[0],
      status_code: context.statusCode,
    });
    Sentry.captureException(error);
  });
}

export { enabled as isMonitoringEnabled, Sentry, release as sentryRelease };
