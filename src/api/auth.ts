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

interface PostAuthPasswordForgetResetApiData {
  email: string;
  captcha: string;
  password: string;
  confirmPassword: string;
}

export function postAuthPasswordForgetResetApi(
  data: PostAuthPasswordForgetResetApiData,
) {
  return request.post<never, SuccessResponse<unknown>>(
    '/auth/password/forget/reset',
    data,
    {
      loading: true,
    },
  );
}

export const getToolsForgetPasswordEmailApi = (email: string) => {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/auth/forget-password-email',
    {
      params: { email },
      loading: true,
    },
  );
};

export const getToolsForgetPasswordEmailVerifyCodeApi = (params: {
  email: string;
  captcha: string;
}) => {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/auth/forget-password-email/verify-code',
    {
      params,
      loading: true,
    },
  );
};
