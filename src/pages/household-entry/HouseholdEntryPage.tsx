import type { FC } from 'react';
import { Button, ErrorBlock } from 'antd-mobile';
import { TeamOutline } from 'antd-mobile-icons';
import { Home } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HouseholdStatus, useMyHouseholdQuery } from '@/entities/household';
import { HouseholdPageState } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const HouseholdEntryPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const location = useLocation();
  const query = useMyHouseholdQuery();
  const household = query.data;

  const handleBack = () => {
    const state = location.state as { dissolved?: boolean } | null;
    if (state?.dissolved) {
      navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
      return;
    }
    navigate(-1);
  };

  if (household?.status === HouseholdStatus.ACTIVE) {
    return <Navigate replace to={ROUTES_PATH.HOUSEHOLD_HOME.getPath(household.id)} />;
  }

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={handleBack}>
        {t('entry.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdPageState
          errorDescription={t('common.loadErrorDescription')}
          errorTitle={t('common.loadError')}
          isError={query.isError}
          isLoading={query.isLoading}
          loadingLabel={t('common.loading')}
          onRetry={() => void query.refetch()}
          retryLabel={t('common.retry')}
        >
          {!household && (
            <section className="card-rounded flex min-h-[420px] flex-col items-center justify-center bg-white px-5 text-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-font-black">
                <Home />
              </span>
              <h1 className="text-xl font-medium text-font-black">{t('entry.none')}</h1>
              <p className="mt-2 max-w-[290px] text-sm leading-6 text-font-gray">{t('entry.noneDescription')}</p>
              <Button
                block
                className="mt-8"
                color="primary"
                data-testid="household-create"
                onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_CREATE.getPath())}
                size="large"
              >
                {t('entry.create')}
              </Button>
              <Button
                block
                className="mt-3"
                fill="outline"
                onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_JOIN.getPath())}
                size="large"
              >
                {t('entry.join')}
              </Button>
            </section>
          )}

          {household?.status === HouseholdStatus.PENDING_PARTNER && (
            <section className="card-rounded flex min-h-[420px] flex-col items-center justify-center bg-white px-5 text-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-font-black">
                <TeamOutline />
              </span>
              <h1 className="text-xl font-medium text-font-black">{t('entry.pending')}</h1>
              <p className="mt-2 max-w-[290px] text-sm leading-6 text-font-gray">{t('entry.pendingDescription')}</p>
              <p className="mt-3 text-xs text-font-gray">
                {t('entry.sharedSince', { month: household.sharedStartMonth.slice(0, 7) })}
              </p>
              <Button
                block
                className="mt-8"
                color="primary"
                onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_INVITATION.getPath(household.id))}
                size="large"
              >
                {t('entry.manageInvitation')}
              </Button>
            </section>
          )}

          {household?.status === HouseholdStatus.DISSOLVED && (
            <div className="flex min-h-[360px] items-center justify-center">
              <ErrorBlock status="empty" title={t('common.dissolved')} />
            </div>
          )}
        </HouseholdPageState>
      </main>
    </div>
  );
};

export default HouseholdEntryPage;
