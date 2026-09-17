import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { scrubMonitoringUrl } from './sentry-filter';

export interface TransportContext {
  kind: 'network' | 'timeout';
  method: string;
  url?: string;
  path: string;
  errorCode?: string;
  durationMs?: number;
  timeoutMs?: number;
  xhrStatus?: number;
  readyState?: number;
  route: string;
  online: boolean;
  visibility: DocumentVisibilityState;
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  serviceWorkerControlled?: boolean;
}

export function requestUrl(config: AxiosRequestConfig = {}) {
  try {
    // Use Axios joining rules: baseURL /api + url /users sends /api/users.
    // Exclude params/paramsSerializer so diagnostics never serialize payloads.
    const uri = axios.getUri({ baseURL: config.baseURL, url: config.url });
    const url = new URL(uri, window.location.origin);
    return { url: scrubMonitoringUrl(`${url.origin}${url.pathname}`), path: scrubMonitoringUrl(url.pathname) };
  }
  catch {
    return { url: undefined, path: '/unknown' };
  }
}

export function buildTransportContext(error: {
  config?: AxiosRequestConfig;
  code?: string;
  request?: { status?: number; readyState?: number };
}, kind: TransportContext['kind']): TransportContext {
  const config = error.config;
  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; rtt?: number; downlink?: number };
  }).connection;
  const route = window.location.hash.startsWith('#/')
    ? window.location.hash.slice(1)
    : window.location.pathname;
  return {
    kind,
    method: config?.method?.toUpperCase() ?? 'GET',
    ...requestUrl(config),
    errorCode: error.code,
    durationMs: config?.monitoringStartedAt === undefined
      ? undefined
      : Math.max(0, Math.round(performance.now() - config.monitoringStartedAt)),
    timeoutMs: config?.timeout,
    xhrStatus: error.request?.status,
    readyState: error.request?.readyState,
    route: scrubMonitoringUrl(route),
    online: navigator.onLine,
    visibility: document.visibilityState,
    effectiveType: connection?.effectiveType,
    rtt: connection?.rtt,
    downlink: connection?.downlink,
    serviceWorkerControlled: navigator.serviceWorker ? !!navigator.serviceWorker.controller : undefined,
  };
}
