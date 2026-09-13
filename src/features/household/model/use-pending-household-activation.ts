import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HouseholdStatus,
  removeHouseholdInvitation,
  useMyHouseholdQuery,
} from '@/entities/household';
import { ROUTES_PATH } from '@/shared/config/routes';

/**
 * Polls the current household while it waits for a partner and automatically
 * enters the household home once the partner joins (status becomes ACTIVE).
 */
export function usePendingHouseholdActivation() {
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

  useEffect(() => {
    if (
      !household
      || household.status !== HouseholdStatus.ACTIVE
      || handledActiveRef.current
    ) {
      return;
    }

    handledActiveRef.current = true;
    removeHouseholdInvitation(household.id);

    navigate(
      ROUTES_PATH.HOUSEHOLD_HOME.getPath(household.id),
      { replace: true },
    );
  }, [household, navigate]);
}
