import { request } from '@/utils';
import type { UserInfo } from '@/api/user';

interface LoginRes {
  token: string;
  userInfo: UserInfo;
}

export function login(body:
  | { username: string; password: string }
  | { email: string; emailCode: string }, loading = true) {
  return request.post<never, SuccessResponse<LoginRes>>('/auth/login', body, {
    loading,
  });
}

export function sign(body: {
  username?: string;
  name?: string;
  email: string;
  password: string;
  emailCode: string;
}, loading = true) {
  return request.post<never, SuccessResponse<LoginRes>>('/auth/sign', body, {
    loading,
  });
}

export function loginEmailCaptchaApi(email: string, loading = true) {
  return request.get<never, SuccessResponse<unknown>>(
    '/auth/login/email/captcha',
    {
      params: {
        email,
      },
      loading,
    },
  );
}

interface PostAuthPasswordForgetResetApiData {
  email: string;
  captcha: string;
  password: string;
  confirmPassword: string;
}

export function postAuthPasswordForgetResetApi(
  data: PostAuthPasswordForgetResetApiData,
  loading = false,
) {
  return request.post<never, SuccessResponse<unknown>>(
    '/auth/password/forget/reset',
    data,
    {
      loading,
    },
  );
}

export function getToolsForgetPasswordEmailApi(email: string, loading = false) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/auth/forget-password-email',
    {
      params: { email },
      loading,
    },
  );
}

export function getToolsForgetPasswordEmailVerifyCodeApi(params: {
  email: string;
  captcha: string;
}, loading = false) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/auth/forget-password-email/verify-code',
    {
      params,
      loading,
    },
  );
}
