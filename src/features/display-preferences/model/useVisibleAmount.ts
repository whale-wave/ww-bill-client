import { isAmountVisible, useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { useDisplayPreference } from './useDisplayPreference';

export function useVisibleAmount() {
  const { data: userAppConfig } = useGetUserAppConfigQuery();
  const [visibleAmount, setVisibleAmount] = useDisplayPreference('personal', 'amount-visible', userAppConfig?.isDisplayAmount);
  const [visibleAmountSwitch, setVisibleAmountSwitch] = useDisplayPreference('personal', 'amount-switch', userAppConfig?.isDisplayAmountSwitch);

  return {
    visibleAmount,
    visibleAmountSwitch,
    isVisibleAmount: isAmountVisible({ isDisplayAmount: visibleAmount, isDisplayAmountSwitch: visibleAmountSwitch }),
    onToggleVisibleAmount: () => setVisibleAmount(!visibleAmount),
    setVisibleAmountSwitch,
  };
}
