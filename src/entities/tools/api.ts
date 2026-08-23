import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function getToolsEmailApi(email: string, loading = false) {
  return request.get<unknown, SuccessResponse<unknown>>('/tools/email', {
    params: { email },
    loading,
  });
}
