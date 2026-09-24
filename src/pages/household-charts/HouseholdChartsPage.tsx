import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdPreferencesQuery } from '@/entities/household';
import { HouseholdBottomNav, HouseholdScopeBoundary } from '@/features/household';
import { ChartDashboardHome } from '@/pages/chart/chart-home/ChartDashboardHome';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const ChartsContent: FC<{ householdId: string }> = ({ householdId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('household');
  const preferenceQuery = useHouseholdPreferencesQuery({ params: { householdId } });
  return (
    <>
      <ChartDashboardHome
        defaultPeriod="month"
        hideAmounts={preferenceQuery.data?.hideTotalAmount === true}
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
