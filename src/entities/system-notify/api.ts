import type { UserEntity } from '@/entities/user';
import { request } from '@/shared/api';

export interface SystemNotify {
  id: number;
  content: string;
  coverPicture: string;
  isGlobal: boolean;
  updatedAt: string;
  createdAt: string;
  user: UserEntity;
}

export function getSystemNotifyApi() {
  return request.get<unknown, SuccessResponse<SystemNotify[]>>(
    `/system_notify`,
  );
}
