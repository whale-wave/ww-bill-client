import { request } from '@/shared/api';

export function getToolsEmailApi(email: string) {
  return request.get<unknown, any>('/tools/email', {
    params: { email },
    loading: true,
  });
}
