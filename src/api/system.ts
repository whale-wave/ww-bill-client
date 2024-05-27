import { request } from '@/utils';

export function getSystemNotifyApi() {
  return request.get<unknown, SuccessResponse<SystemNotify[]>>(
    `/system_notify`,
  );
}
