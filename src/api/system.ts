import { request } from '@/utils';

export function getSystemNotifyApi() {
  return request.get<unknown, SuccessResponse<any>>(`/system_notify`);
}
