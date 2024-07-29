import { request } from '@/utils';

export interface UserEntity {
  id: number;
  name: string;
  avatar: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

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
