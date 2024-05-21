import { request } from '@/utils';

interface LoginRes {
  token: string;
  userInfo: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    email: string;
  };
}

export const login = (
  body:
    | { username: string; password: string }
    | { email: string; emailCode: string },
  loading = true,
) => {
  return request.post<never, SuccessResponse<LoginRes>>('/auth/login', body, {
    loading,
  });
};

export const sign = (
  body: {
    username?: string;
    name?: string;
    email: string;
    password: string;
    emailCode: string;
  },
  loading = true,
) => {
  return request.post<never, SuccessResponse<LoginRes>>('/auth/sign', body, {
    loading,
  });
};

export const loginEmailCaptchaApi = (email: string, loading = true) => {
  return request.get<never, SuccessResponse<unknown>>(
    '/auth/login/email/captcha',
    {
      params: {
        email,
      },
      loading,
    },
  );
};
