import type { UserInfo } from '@/entities/user';
import type { AuthRequestAuth, SuccessResponse } from '@/shared/api';
import { captureRequestAuth, request } from '@/shared/api';

interface LoginRes {
  deletionCancelled?: boolean;
  token: string;
  userInfo: UserInfo;
}

let presenceRequestQueue: Promise<void> = Promise.resolve();

export function login(body:
  | { username: string; password: string }
  | { email: string; emailCode: string }) {
  return request.post<never, SuccessResponse<LoginRes>>('/auth/login', body);
}

export function reportPresence(
  state: 'offline' | 'online' = 'online',
  authContext: AuthRequestAuth = captureRequestAuth(),
) {
  const presenceRequest = presenceRequestQueue.then(() => (
    request.post<never, SuccessResponse<unknown>>('/auth/presence', { state }, {
      authContext,
      silent: true,
    })
  ));
  presenceRequestQueue = presenceRequest.then(() => undefined, () => undefined);
  return presenceRequest;
}

export function sign(body: {
  username?: string;
  name?: string;
  email: string;
  password: string;
  emailCode: string;
}) {
  return request.post<never, SuccessResponse<LoginRes>>('/auth/sign', body);
}

export function loginEmailCaptchaApi(email: string) {
  return request.get<never, SuccessResponse<unknown>>(
    '/auth/login/email/captcha',
    {
      params: {
        email,
      },
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
) {
  return request.post<never, SuccessResponse<unknown>>(
    '/auth/password/forget/reset',
    data,
    {},
  );
}

export function getToolsForgetPasswordEmailApi(email: string) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/auth/forget-password-email',
    { params: { email } },
  );
}

export function getToolsForgetPasswordEmailVerifyCodeApi(params: {
  email: string;
  captcha: string;
}) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/auth/forget-password-email/verify-code',
    {
      params,
    },
  );
}
