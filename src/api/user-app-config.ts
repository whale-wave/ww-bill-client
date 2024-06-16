import { request } from '@/utils';
import type { User } from '@/api/system';

export interface UserAppConfig {
  id: string;
  isDisplayAmount: boolean;
  isDisplayAmountSwitch: boolean;
  isOpenSoundEffect: boolean;
  user: User;
}

export function getUserAppConfigApi() {
  return request.get<unknown, SuccessResponse<UserAppConfig>>('/user-app-config');
}

export interface PatchUserAppConfigBody extends Partial<Omit<UserAppConfig, 'user' | 'id'>> {}

export function patchUserAppConfigApi(body: PatchUserAppConfigBody) {
  return request.patch<unknown, SuccessResponse<unknown>>('/user-app-config', body);
}
