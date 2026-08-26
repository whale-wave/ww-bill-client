import type { AuthRequestIdentity } from './auth-injection';
import { Toast } from 'antd-mobile';
import { i18n } from '@/shared/i18n';
import { handleAuthFailure, isTransitionCurrent } from './auth-injection';

function clearTokenToLogin(msg: string, identity?: AuthRequestIdentity, statusCode = 401) {
  if (identity && !isTransitionCurrent(identity))
    return undefined;
  const marker = handleAuthFailure(identity ?? { sessionEpoch: 0, credentialRevision: 0 }, statusCode) as { sessionEpoch?: number } | undefined;
  Toast.show({ content: msg, icon: 'fail', duration: 1000 });
  setTimeout(() => {
    if (!marker || isTransitionCurrent({ sessionEpoch: marker.sessionEpoch ?? -1, credentialRevision: 0 }))
      window.location.hash = '#/login';
  }, 1000);
  return msg;
}

export function baseResponseProcess(statusCode: number | string, identity?: AuthRequestIdentity) {
  switch (Number.parseInt(`${statusCode}`)) {
    case 403:
      Toast.show({
        content: i18n.t('common:api.forbidden'),
        icon: 'fail',
        duration: 1000,
      });
      return i18n.t('common:api.forbidden');
    case 402:
      return clearTokenToLogin(i18n.t('common:api.authFailed'), identity, 402);
    case 401:
      return clearTokenToLogin(i18n.t('common:api.notLoggedIn'), identity);
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
