import { request } from '@/utils';

export interface User {
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
  user: User;
}

export function getSystemNotifyApi() {
  return request.get<unknown, SuccessResponse<SystemNotify[]>>(
    `/system_notify`,
  );
}
