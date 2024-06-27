import { request } from '@/utils';

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
  return request.get<unknown, SuccessResponse<UserInfo>>('/user/userInfo');
}

export interface usePutUserUserInfoData {
  avatar: string;
  name: string;
}

export function putUserUserInfoApi(data: usePutUserUserInfoData, loading = false) {
  return request.put<unknown, SuccessResponse<any>>('/user/userInfo', data, {
    loading,
  });
}

export function changePassword(data: UpdatePassword, loading = true) {
  return request.put<unknown, SuccessResponse<any>>('/user/password', data, {
    loading,
  });
}

export function checkInPost(loading = true) {
  return request.post<unknown, SuccessResponse<any>>('/check_in', null, {
    loading,
  });
}
