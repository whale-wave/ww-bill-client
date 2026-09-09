import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface SystemNotify {
  id: number;
  title: string;
  content: string;
  coverPicture?: string;
  isGlobal?: boolean;
  publishedAt?: string;
  publishedVersion: number;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export function getSystemNotifyApi() {
  return request.get<unknown, SuccessResponse<SystemNotify[]>>(
    `/system_notify`,
  );
}
