import type { SuccessResponse } from './types';

export function isSuccessApi<T extends SuccessResponse<unknown>>(
  response?: T,
): response is T {
  return response?.statusCode === 200;
}
