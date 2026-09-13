import type { SuccessResponse } from './types';
import { addBreadcrumb } from '@sentry/capacitor';
import axios from 'axios';
import { i18n } from '@/shared/i18n';
import { captureTransportError } from '@/shared/monitoring';
import { showAppError } from '@/shared/ui';
import { captureRequestAuth, isTransitionCurrent } from './auth-injection';
import { processAuthFailure } from './request-process';

export interface RequestError extends Error {
  kind: 'network' | 'timeout' | 'http';
  code?: string;
  data: unknown;
  statusCode: number;
}

export function isRequestError(error: unknown): error is RequestError {
  return error instanceof Error
    && typeof (error as Partial<RequestError>).kind === 'string'
    && typeof (error as Partial<RequestError>).statusCode === 'number';
}

function requestPath(config: { url?: string; baseURL?: string }) {
  try {
    return new URL(config.url ?? '', config.baseURL ?? window.location.origin).pathname;
  }
  catch {
    return '/unknown';
  }
}

let host = '';
if (typeof import.meta.env.VITE_HOST === 'string')
  host = import.meta.env.VITE_HOST;

const request = axios.create({
  baseURL: `${host}/api`,
  timeout: 50000,
});

request.interceptors.request.use((config) => {
  const auth = config.authContext ?? captureRequestAuth();
  const token = auth.token;
  config.authIdentity = auth.identity;
  if (token) {
    (
      config.headers as { Authorization: string }
    ).Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    addBreadcrumb({ category: 'http', message: `${response.config.method?.toUpperCase() ?? 'GET'} ${requestPath(response.config)}`, data: { method: response.config.method, status_code: response.status, url: requestPath(response.config) }, level: 'info' });
    return response.data;
  },
  (error) => {
    const { code, config, message, response } = error;

    if (code === 'ECONNABORTED' || message?.includes('timeout')) {
      if (navigator.onLine !== false)
        captureTransportError(error, { method: config?.method, url: config?.url, statusCode: 408 });
      const requestError = createRequestError({
        code: undefined,
        data: null,
        message: i18n.t('common:api.requestTimeout'),
        statusCode: 408,
      }, 'timeout');
      if (!config?.silent)
        showAppError(requestError, { dedupeKey: 'transport:timeout' });
      console.error('请求超时');
      return Promise.reject(requestError);
    }

    if (!response) {
      if (navigator.onLine !== false)
        captureTransportError(error, { method: config?.method, url: config?.url, statusCode: 0 });
      const requestError = createRequestError({
        code: undefined,
        data: null,
        message: i18n.t('common:api.networkError'),
        statusCode: 0,
      }, 'network');
      if (!config?.silent)
        showAppError(requestError, { dedupeKey: 'transport:network' });
      return Promise.reject(requestError);
    }

    const responseData = normalizeErrorResponse(response);
    addBreadcrumb({ category: 'http', message: `${config?.method?.toUpperCase() ?? 'GET'} ${requestPath(config ?? {})}`, data: { method: config?.method, status_code: response.status, url: requestPath(config ?? {}) }, level: response.status >= 500 ? 'error' : 'warning' });
    const identity = config?.authIdentity;
    const current = !identity || isTransitionCurrent(identity);
    const requestError = createRequestError(responseData, 'http');
    const authMessage = processAuthFailure(responseData.statusCode, identity);
    if (!config?.silent && current && authMessage) {
      showAppError(requestError, {
        dedupeKey: `auth:${responseData.statusCode}`,
        message: authMessage,
      });
    }
    return Promise.reject(requestError);
  },
);

export default request;

function createRequestError(
  response: ReturnType<typeof normalizeErrorResponse>,
  kind: RequestError['kind'],
): RequestError {
  return Object.assign(new Error(response.message), response, { kind });
}

function normalizeErrorResponse(response: {
  data?: Partial<SuccessResponse<unknown>> & { code?: unknown };
  status: number;
  statusText?: string;
}) {
  const message = response.data?.message ?? response.statusText ?? i18n.t('common:api.requestFailed')!;
  return {
    code: typeof response.data?.code === 'string' ? response.data.code : undefined,
    data: response.data?.data ?? null,
    message: Array.isArray(message) ? message[0] : message,
    statusCode: Number(response.data?.statusCode ?? response.status),
  };
}
