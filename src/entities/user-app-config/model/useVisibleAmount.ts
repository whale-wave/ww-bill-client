import type { UserAppConfig } from '../api';

export function isAmountVisible(config?: Pick<UserAppConfig, 'isDisplayAmount' | 'isDisplayAmountSwitch'>): boolean {
  if (!config?.isDisplayAmountSwitch)
    return true;
  return config.isDisplayAmount;
}
