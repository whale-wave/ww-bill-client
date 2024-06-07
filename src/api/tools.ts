import { request } from '@/utils';

export const getToolsCaptchaApi = () => {
  return request.get<unknown, any>('/tools/captcha');
};

export const getToolsEmailApi = (email: string) => {
  return request.get<unknown, any>('/tools/email', {
    params: { email },
    loading: true,
  });
};
