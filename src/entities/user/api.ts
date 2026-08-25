import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface UserEntity {
  id: number;
  name: string;
  avatar: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: number;
  userId: string;
  name: string;
  username: string;
  avatar: string;
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
  avatar: string;
  name: string;
}

export function putUserUserInfoApi(data: usePutUserUserInfoData, loading = false) {
  return request.put<unknown, SuccessResponse<unknown>>('/user/userInfo', data, {
    loading,
  });
}

export function changePassword(data: UpdatePassword, loading = true) {
  return request.put<unknown, SuccessResponse<unknown>>('/user/password', data, {
    loading,
  });
}

export function postCheckInApi(loading = true) {
  return request.post<unknown, SuccessResponse<unknown>>('/check_in', null, {
    loading,
  });
}
