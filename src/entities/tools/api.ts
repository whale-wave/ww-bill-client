import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function getToolsEmailApi(email: string) {
  return request.get<unknown, SuccessResponse<unknown>>('/tools/email', {
    params: { email },
    loading: true,
  });
}
