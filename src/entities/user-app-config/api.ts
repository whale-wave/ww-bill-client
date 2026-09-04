import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export const APPEARANCE_TEMPLATES = ['fresh', 'minimal', 'glass'] as const;
export type AppearanceTemplate = typeof APPEARANCE_TEMPLATES[number];

export const APPEARANCE_ACCENTS = ['sky', 'coral', 'lavender', 'mint'] as const;
export type AppearanceAccent = typeof APPEARANCE_ACCENTS[number];

export const DISCOVERY_CARD_IDS = ['bill', 'budget', 'asset'] as const;
export type DiscoveryCardId = typeof DISCOVERY_CARD_IDS[number];

export interface UserAppConfig {
  id: string;
  userId: number;
  gestureLockEnabled: boolean;
  isDisplayAmount: boolean;
  isDisplayAmountSwitch: boolean;
  isOpenHapticEffect: boolean;
  isOpenMotionEffect: boolean;
  isOpenSoundEffect: boolean;
  isLedgerQuickSwitchEnabled: boolean;
  ledgerQuickSwitchVersion: number;
  appearanceTemplate: AppearanceTemplate;
  appearanceAccent: AppearanceAccent;
  discoveryCardOrder: DiscoveryCardId[];
  visibleDiscoveryCards: DiscoveryCardId[];
}

export function getUserAppConfigApi() {
  return request.get<unknown, SuccessResponse<UserAppConfig>>('/user-app-config');
}

export interface PatchUserAppConfigBody extends Partial<Omit<
  UserAppConfig,
  'id' | 'userId' | 'isLedgerQuickSwitchEnabled' | 'ledgerQuickSwitchVersion' | 'appearanceAccent'
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
