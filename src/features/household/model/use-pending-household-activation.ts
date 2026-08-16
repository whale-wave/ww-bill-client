import { Toast } from 'antd-mobile';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HouseholdStatus,
  removeHouseholdInvitation,
  useMyHouseholdQuery,
} from '@/entities/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

/**
 * Polls the current household while it waits for a partner and automatically
 * enters the household home once the partner joins (status becomes ACTIVE).
 */
export function usePendingHouseholdActivation() {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const query = useMyHouseholdQuery({
    queryOptions: {
      refetchInterval: data => (
        data?.data?.status === HouseholdStatus.PENDING_PARTNER
          ? 3000
          : false
      ),
    },
  });
  const household = query.data;
  const handledActiveRef = useRef(false);
  const previousStatusRef = useRef<HouseholdStatus | undefined>(undefined);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    if (household)
      previousStatusRef.current = household.status;

    if (
      !household
      || household.status !== HouseholdStatus.ACTIVE
      || handledActiveRef.current
    ) {
      return;
    }

    handledActiveRef.current = true;
    removeHouseholdInvitation(household.id);

    if (previousStatus === HouseholdStatus.PENDING_PARTNER) {
      Toast.show({
        content: t('invitation.partnerJoined'),
        icon: 'success',
      });
    }

    navigate(
      ROUTES_PATH.HOUSEHOLD_HOME.getPath(household.id),
      { replace: true },
    );
  }, [household, navigate, t]);
}
