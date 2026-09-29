import type { SuccessResponse } from './types';
import { addBreadcrumb } from '@sentry/capacitor';
import axios from 'axios';
import { i18n } from '@/shared/i18n';
import { captureTransportError } from '@/shared/monitoring';
import { buildTransportContext, requestUrl } from '@/shared/monitoring/transport-context';
import { showAppError } from '@/shared/ui';
import { captureRequestAuth, isTransitionCurrent } from './auth-injection';
import { getClientDeviceHeaders } from './client-device';
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

let host = '';
if (typeof import.meta.env.VITE_HOST === 'string')
  host = import.meta.env.VITE_HOST;

const request = axios.create({
  headers: { 'X-Classification-Version': '2' },
  baseURL: `${host}/api`,
  timeout: 50000,
});

request.interceptors.request.use(async (config) => {
  config.monitoringStartedAt = performance.now();
  const auth = config.authContext ?? captureRequestAuth();
  const token = auth.token;
  config.authIdentity = auth.identity;
  if (token) {
    (
      config.headers as { Authorization: string }
    ).Authorization = `Bearer ${token}`;
  }
  const isDeviceEvent = config.url === '/auth/login' || config.url === '/auth/presence';
  const device = isDeviceEvent ? await getClientDeviceHeaders() : undefined;
  if (device) {
    config.headers.set('X-Client-Platform', device.platform);
    if (device.model)
      config.headers.set('X-Client-Device-Model', device.model);
    if (device.osVersion)
      config.headers.set('X-Client-OS-Version', device.osVersion);
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    addBreadcrumb({ category: 'http', message: `${response.config.method?.toUpperCase() ?? 'GET'} ${requestUrl(response.config).path}`, data: { method: response.config.method, status_code: response.status, url: requestUrl(response.config).path }, level: 'info' });
    return response.data;
  },
  (error) => {
    const { code, config, message, response } = error;

    if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || message?.includes('timeout')) {
      if (navigator.onLine !== false)
        captureTransportError(error, buildTransportContext(error, 'timeout'));
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
      if (navigator.onLine !== false && !axios.isCancel(error))
        captureTransportError(error, buildTransportContext(error, 'network'));
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
    addBreadcrumb({ category: 'http', message: `${config?.method?.toUpperCase() ?? 'GET'} ${requestUrl(config ?? {}).path}`, data: { method: config?.method, status_code: response.status, url: requestUrl(config ?? {}).path }, level: response.status >= 500 ? 'error' : 'warning' });
    const identity = config?.authIdentity;
    const current = !identity || isTransitionCurrent(identity);
    const requestError = createRequestError(responseData, 'http');
    const authMessage = processAuthFailure(responseData.statusCode, identity);
    if (!config?.silent && current) {
      showAppError(requestError, {
        dedupeKey: `http:${responseData.statusCode}:${requestError.message}`,
        message: authMessage ?? requestError.message,
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
