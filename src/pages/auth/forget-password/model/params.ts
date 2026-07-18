export interface PasswordRecoveryParams {
  captcha: string;
  email: string;
}

export function buildVerifyCodePath(email: string): string {
  const searchParams = new URLSearchParams({ email });
  return `/forget-password/verify-code?${searchParams.toString()}`;
}

export function buildResetPath(params: PasswordRecoveryParams): string {
  const searchParams = new URLSearchParams({
    captcha: params.captcha,
    email: params.email,
  });
  return `/forget-password/reset?${searchParams.toString()}`;
}

export function readPasswordRecoveryParams(searchParams: URLSearchParams): PasswordRecoveryParams {
  return {
    captcha: searchParams.get('captcha') ?? '',
    email: searchParams.get('email') ?? '',
  };
}
