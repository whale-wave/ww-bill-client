import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export interface UserAppConfig {
  id: string;
  userId: number;
  gestureLockEnabled: boolean;
  isDisplayAmount: boolean;
  isDisplayAmountSwitch: boolean;
  isOpenSoundEffect: boolean;
  isLedgerQuickSwitchEnabled: boolean;
  ledgerQuickSwitchVersion: number;
}

export function getUserAppConfigApi() {
  return request.get<unknown, SuccessResponse<UserAppConfig>>('/user-app-config');
}

export interface PatchUserAppConfigBody extends Partial<Omit<
  UserAppConfig,
  'id' | 'userId' | 'isLedgerQuickSwitchEnabled' | 'ledgerQuickSwitchVersion'
>> {}

export function patchUserAppConfigApi(body: PatchUserAppConfigBody) {
  return request.patch<unknown, SuccessResponse<unknown>>('/user-app-config', body);
}

export interface PatchLedgerQuickSwitchApiData {
  enabled: boolean;
  version: number;
}

export interface LedgerQuickSwitchPreference {
  enabled: boolean;
  version: number;
}

export function patchLedgerQuickSwitchApi(data: PatchLedgerQuickSwitchApiData) {
  return request.patch<unknown, SuccessResponse<LedgerQuickSwitchPreference>>(
    '/user-app-config/ledger-quick-switch',
    data,
  );
}
