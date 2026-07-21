import type { ApiEnvelopeError } from '@/shared/api';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { assertSuccessApi } from '@/shared/api';

describe('assertSuccessApi', () => {
  it('returns a successful business envelope unchanged', () => {
    const response = {
      data: ['ledger-1'],
      message: '成功',
      statusCode: 200,
    };

    expect(assertSuccessApi(response)).toBe(response);
  });

  it.each([201, 204, 205, 299])('accepts the successful %s business envelope', (statusCode) => {
    const response = {
      data: undefined,
      message: '成功',
      statusCode,
    };

    expect(assertSuccessApi(response)).toBe(response);
  });

  it('throws a structured error for a failed business envelope', () => {
    const response = {
      data: { reason: 'suspended' },
      message: '账本已停用',
      statusCode: 400,
    };

    expect(() => assertSuccessApi(response)).toThrowError(expect.objectContaining({
      data: { reason: 'suspended' },
      message: '账本已停用',
      statusCode: 400,
    }));
  });

  it('does not promise that failed envelopes contain business data', () => {
    expectTypeOf<ApiEnvelopeError<string>['data']>()
      .toEqualTypeOf<string | null | undefined>();
  });

  it.each([199, 300, 400])('rejects the non-2xx %s business envelope', (statusCode) => {
    expect(() => assertSuccessApi({
      data: null,
      message: '失败',
      statusCode,
    })).toThrowError(expect.objectContaining({ statusCode }));
  });
});
