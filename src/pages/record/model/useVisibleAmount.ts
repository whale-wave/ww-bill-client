import { useCallback, useMemo } from 'react';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/entities/user-app-config';

export function useVisibleAmount() {
  const { data: userAppConfig } = useGetUserAppConfigQuery();
  const visibleAmount = userAppConfig?.isDisplayAmount ?? false;
  const visibleAmountSwitch = userAppConfig?.isDisplayAmountSwitch ?? false;
  const [patchUserAppConfigMutate] = usePatchUserAppConfigMutation();

  const isVisibleAmount = useMemo(() => {
    if (!visibleAmountSwitch) {
      return true;
    }

    return visibleAmount;
  }, [visibleAmount, visibleAmountSwitch]);

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
