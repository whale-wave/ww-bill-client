import type { SuccessResponse } from './types';

export interface ApiEnvelopeError<T = unknown> extends Error {
  statusCode: number;
  data: T | null | undefined;
}

export function assertSuccessApi<T>(response: SuccessResponse<T>) {
  if (response.statusCode >= 200 && response.statusCode < 300)
    return response;

  const error = new Error(response.message) as ApiEnvelopeError<T>;
  error.data = response.data;
  error.statusCode = response.statusCode;
  throw error;
}
