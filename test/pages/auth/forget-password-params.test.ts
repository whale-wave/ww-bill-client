import { describe, expect, it } from 'vitest';
import {
  buildResetPath,
  buildVerifyCodePath,
  readPasswordRecoveryParams,
} from '@/pages/auth/forget-password/model/params';

describe('password recovery parameters', () => {
  it('round-trips Unicode and plus characters through both navigation steps', () => {
    const email = '鲸浪+test@example.com';
    const verifyUrl = new URL(buildVerifyCodePath(email), 'https://example.test');

    expect(readPasswordRecoveryParams(verifyUrl.searchParams).email).toBe(email);

    const resetUrl = new URL(
      buildResetPath({ captcha: '123456', email }),
      'https://example.test',
    );

    expect(readPasswordRecoveryParams(resetUrl.searchParams)).toEqual({
      captcha: '123456',
      email,
    });
  });
});
