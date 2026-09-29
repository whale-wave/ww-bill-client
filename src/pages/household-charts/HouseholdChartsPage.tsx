import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdPreferencesQuery } from '@/entities/household';
import { useHouseholdAmountPreference } from '@/features/display-preferences';
import { HouseholdBottomNav, HouseholdScopeBoundary } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { ChartDashboardHome } from '@/widgets/chart-dashboard';

const ChartsContent: FC<{ householdId: string }> = ({ householdId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('household');
  const preferenceQuery = useHouseholdPreferencesQuery({ params: { householdId } });
  const [isAmountHidden] = useHouseholdAmountPreference(householdId, preferenceQuery.data?.hideTotalAmount);
  return (
    <>
      <ChartDashboardHome
        defaultPeriod="month"
        hideAmounts={isAmountHidden}
        scope={{ kind: 'household', householdId }}
      />
      <HouseholdBottomNav
        active="charts"
        chartsLabel={t('home.chartsTab')}
        detailsLabel={t('home.detailsTab')}
        onCharts={() => undefined}
        onDetails={() => navigate(ROUTES_PATH.HOUSEHOLD_HOME.getPath(householdId))}
      />
    </>
  );
};

const HouseholdChartsPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-white">
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <ChartsContent householdId={household.id} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdChartsPage;
