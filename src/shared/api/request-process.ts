import { Toast } from 'antd-mobile';
import { i18n } from '@/shared/i18n';
import { handleAuthLogout } from './auth-injection';

function clearTokenToLogin(msg: string) {
  handleAuthLogout();
  Toast.show({ content: msg, icon: 'fail', duration: 1000 });
  setTimeout(() => {
    window.location.hash = '#/login';
  }, 1000);
  return msg;
}

export function baseResponseProcess(statusCode: number | string) {
  switch (Number.parseInt(`${statusCode}`)) {
    case 403:
      return clearTokenToLogin(i18n.t('common:api.loginExpired'));
    case 402:
      return clearTokenToLogin(i18n.t('common:api.authFailed'));
    case 401:
      return clearTokenToLogin(i18n.t('common:api.notLoggedIn'));
  }
}

export function errorResponseProcess(data: {
  message: string[] | string;
  statusCode: number | string;
}) {
  const statusCode
    = typeof data.statusCode === 'number'
      ? data.statusCode
      : Number.parseInt(data.statusCode);
  const params = {
    content: typeof data.message === 'string' ? data.message : data.message[0],
    position: 'top',
    duration: 1000,
  } as { content: string; icon?: string };
  if (statusCode !== 200)
    delete params.icon;
  Toast.show(params);
}
