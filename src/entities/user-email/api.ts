import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function getUserEmailChangeEmailCaptchaApi() {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email/captcha',
    {},
  );
}

export interface PostUserEmailChangeEmailCaptchaVerifyApiParams {
  captcha: string;
}

export function getUserEmailChangeEmailCaptchaVerifyApi(
  params: PostUserEmailChangeEmailCaptchaVerifyApiParams,
) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email/verify',
    {
      params,
    },
  );
}

export function getUserEmailChangeEmailCaptchaNewEmailApi(
  params: {
    newEmail: string;
    captcha: string;
  },
) {
  return request.get<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email/captcha/new-email',
    {
      params,
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
) {
  return request.post<unknown, SuccessResponse<unknown>>(
    '/user-email/change-email',
    data,
    {
    },
  );
}
