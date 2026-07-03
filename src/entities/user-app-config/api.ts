import type { UserEntity } from '@/entities/user';
import { request } from '@/shared/api';

export interface UserAppConfig {
  id: string;
  isDisplayAmount: boolean;
  isDisplayAmountSwitch: boolean;
  isOpenSoundEffect: boolean;
  user: UserEntity;
}

export function getUserAppConfigApi() {
  return request.get<unknown, SuccessResponse<UserAppConfig>>('/user-app-config');
}

export interface PatchUserAppConfigBody extends Partial<Omit<UserAppConfig, 'user' | 'id'>> {}

export function patchUserAppConfigApi(body: PatchUserAppConfigBody) {
  return request.patch<unknown, SuccessResponse<unknown>>('/user-app-config', body);
}
