import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface UserEntity {
  id: number;
  name: string;
  avatar: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: number;
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  checkIn: boolean;
  checkInKeep: number;
  checkInAll: number;
  recordCount: number;
  billRecord: BillRecordType;
  email: string;
}

interface UpdatePassword {
  password: string;
  newPassword: string;
}

export interface BillRecordType {
  expend: number;
  income: number;
  month: number;
  surplus: number;
}

export function getUserUserInfoApi() {
  return request.get<unknown, SuccessResponse<UserInfo>>('/user/userInfo', { silent: true });
}

export interface usePutUserUserInfoData {
  avatar?: string | null;
  name: string;
}

export function putUserUserInfoApi(data: usePutUserUserInfoData) {
  return request.put<unknown, SuccessResponse<unknown>>('/user/userInfo', data);
}

export function changePassword(data: UpdatePassword) {
  return request.put<unknown, SuccessResponse<unknown>>('/user/password', data);
}

export function postCheckInApi() {
  return request.post<unknown, SuccessResponse<unknown>>('/check_in', null);
}
