import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';
import { resolvePublicMediaUrl } from '@/shared/lib/public-media-url';

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

export async function verifyUploadedAvatar(sourceUrl: string): Promise<void> {
  const avatarVariantUrl = sourceUrl.replace(/\/main-v1$/i, '/avatar-v1');
  const resolvedUrl = resolvePublicMediaUrl(avatarVariantUrl, 'avatar-v1');
  if (!resolvedUrl)
    throw new Error('Uploaded avatar URL is invalid');

  const blob = await request.get<Blob, Blob>(resolvedUrl, {
    responseType: 'blob',
    silent: true,
  });
  if (!(blob instanceof Blob) || blob.size <= 0 || !blob.type.startsWith('image/'))
    throw new Error('Uploaded avatar is not readable');
}

export function changePassword(data: UpdatePassword) {
  return request.put<unknown, SuccessResponse<unknown>>('/user/password', data);
}

export interface AccountDeletionStatus {
  canRequest: boolean;
  deletionRequestedAt: string | null;
  deletionScheduledAt: string | null;
  blockers: { customLedgerCount: number; householdCount: number };
}

export function getAccountDeletionStatusApi() {
  return request.get<unknown, SuccessResponse<AccountDeletionStatus>>('/user/deletion');
}

export function postAccountDeletionEmailCodeApi() {
  return request.post<unknown, SuccessResponse<unknown>>('/user/deletion/email-code');
}

export function postAccountDeletionApi(emailCode: string) {
  return request.post<unknown, SuccessResponse<{ deletionRequestedAt: string; deletionScheduledAt: string }>>('/user/deletion', {
    confirmed: true,
    emailCode,
  });
}

export function postCheckInApi() {
  return request.post<unknown, SuccessResponse<unknown>>('/check_in', null);
}
