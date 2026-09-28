import type { UserAppConfig } from '../api';
import { useCallback, useMemo } from 'react';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '../hooks';

export function isAmountVisible(config?: Pick<UserAppConfig, 'isDisplayAmount' | 'isDisplayAmountSwitch'>): boolean {
  if (!config?.isDisplayAmountSwitch)
    return true;
  return config.isDisplayAmount;
}

export function useVisibleAmount() {
  const { data: userAppConfig } = useGetUserAppConfigQuery();
  const visibleAmount = userAppConfig?.isDisplayAmount ?? false;
  const visibleAmountSwitch = userAppConfig?.isDisplayAmountSwitch ?? false;
  const [patchUserAppConfigMutate] = usePatchUserAppConfigMutation();

  const isVisibleAmount = useMemo(
    () => isAmountVisible(userAppConfig),
    [userAppConfig],
  );
  const onToggleVisibleAmount = useCallback(async () => {
    await patchUserAppConfigMutate({
      isDisplayAmount: !visibleAmount,
    });
  }, [visibleAmount, patchUserAppConfigMutate]);

  return {
    visibleAmount,
    visibleAmountSwitch,
    isVisibleAmount,
    onToggleVisibleAmount,
  };
}
