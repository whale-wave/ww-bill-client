import type { SuccessResponse } from './types';
import { addBreadcrumb } from '@sentry/capacitor';
import { Toast } from 'antd-mobile';
import axios from 'axios';
import { i18n } from '@/shared/i18n';
import { captureTransportError } from '@/shared/monitoring';
import { captureRequestAuth, isTransitionCurrent } from './auth-injection';
import {
  baseResponseProcess,
  errorResponseProcess,
} from './request-process';

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
  if (config.loading)
    loading();
  return config;
});

request.interceptors.response.use(
  (response) => {
    addBreadcrumb({ category: 'http', message: `${response.config.method?.toUpperCase() ?? 'GET'} ${requestPath(response.config)}`, data: { method: response.config.method, status_code: response.status, url: requestPath(response.config) }, level: 'info' });
    if (response.config.loading)
      errorResponseProcess(response.data);
    return response.data;
  },
  (error) => {
    const { code, config, message, response } = error;

    if (code === 'ECONNABORTED' || message?.includes('timeout')) {
      if (navigator.onLine !== false)
        captureTransportError(error, { method: config?.method, url: config?.url, statusCode: 408 });
      if (!config?.silent) {
        Toast.clear();
        Toast.show({ content: i18n.t('common:api.requestTimeout'), icon: 'fail', duration: 1000 });
      }
      console.error('请求超时');
      return Promise.reject(createRequestError({
        code: undefined,
        data: null,
        message: [i18n.t('common:api.requestTimeout')],
        statusCode: 408,
      }));
    }

    if (!response) {
      if (navigator.onLine !== false)
        captureTransportError(error, { method: config?.method, url: config?.url, statusCode: 0 });
      if (!config?.silent) {
        Toast.clear();
        Toast.show({ content: i18n.t('common:api.networkError'), icon: 'fail', duration: 1000 });
      }
      return Promise.reject(createRequestError({
        code: undefined,
        data: null,
        message: [i18n.t('common:api.networkError')],
        statusCode: 0,
      }));
    }

    const responseData = normalizeErrorResponse(response);
    addBreadcrumb({ category: 'http', message: `${config?.method?.toUpperCase() ?? 'GET'} ${requestPath(config ?? {})}`, data: { method: config?.method, status_code: response.status, url: requestPath(config ?? {}) }, level: response.status >= 500 ? 'error' : 'warning' });
    const identity = config?.authIdentity;
    const current = !identity || isTransitionCurrent(identity);
    baseResponseProcess(responseData.statusCode, identity);
    if (config?.loading && ((responseData.statusCode !== 401 && responseData.statusCode !== 402) || current))
      errorResponseProcess(responseData);
    return Promise.reject(createRequestError(responseData));
  },
);

export default request;

function loading() {
  Toast.show({
    content: i18n.t('common:api.loading'),
    maskClickable: false,
    position: 'top',
    duration: 0,
  });
}

function createRequestError(response: ReturnType<typeof normalizeErrorResponse>) {
  return Object.assign(new Error(response.message[0]), response);
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
    message: Array.isArray(message) ? message : [message],
    statusCode: response.data?.statusCode ?? response.status,
  };
}
