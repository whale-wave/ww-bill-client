import type { SuccessResponse } from './types';
import { Toast } from 'antd-mobile';
import axios from 'axios';
import { i18n } from '@/shared/i18n';
import { getAuthToken } from './auth-injection';
import {
  baseResponseProcess,
  errorResponseProcess,
} from './request-process';

let host = '';
if (typeof import.meta.env.VITE_HOST === 'string')
  host = import.meta.env.VITE_HOST;

const request = axios.create({
  baseURL: `${host}/api`,
  timeout: 50000,
});

request.interceptors.request.use((config) => {
  const token = getAuthToken();
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
    if (response.config.loading)
      errorResponseProcess(response.data);
    return response.data;
  },
  (error) => {
    const { code, config, message, response } = error;

    if (code === 'ECONNABORTED' || message?.includes('timeout')) {
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
    baseResponseProcess(responseData.statusCode);
    if (config?.loading)
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
