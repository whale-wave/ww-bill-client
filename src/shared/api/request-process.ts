import { Toast } from 'antd-mobile';
import { useUserStore } from '@/store';

function clearTokenToLogin(msg: string) {
  useUserStore.getState().logOut();
  Toast.show({ content: msg, icon: 'fail', duration: 1000 });
  setTimeout(() => {
    window.location.hash = '#/login';
  }, 1000);
  return msg;
}

export function baseResponseProcess(statusCode: number | string) {
  switch (Number.parseInt(`${statusCode}`)) {
    case 403:
      return clearTokenToLogin('登录已过期');
    case 402:
      return clearTokenToLogin('身份验证失败');
    case 401:
      return clearTokenToLogin('未登录账号');
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
