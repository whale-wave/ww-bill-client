import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function getUserEmailChangeEmailCaptchaApi(
  options: {
    loading?: boolean;
  } = {},
) {
  const { loading = true } = options;
  return request.get<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email/captcha',
    {
      loading,
    },
  );
}

export interface PostUserEmailChangeEmailCaptchaVerifyApiParams {
  captcha: string;
}

export function getUserEmailChangeEmailCaptchaVerifyApi(
  params: PostUserEmailChangeEmailCaptchaVerifyApiParams,
  loading = true,
) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email/verify',
    {
      params,
      loading,
    },
  );
}

export function getUserEmailChangeEmailCaptchaNewEmailApi(
  params: {
    newEmail: string;
    captcha: string;
  },
  loading = false,
) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email/captcha/new-email',
    {
      params,
      loading,
    },
  );
}

export interface PostUserEmailChangeEmailApiData {
  captcha: string;
  newEmail: string;
  newCaptcha: string;
}

export function postUserEmailChangeEmailApi(
  data: PostUserEmailChangeEmailApiData,
  loading = true,
) {
  return request.post<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email',
    data,
    {
      loading,
    },
  );
}
