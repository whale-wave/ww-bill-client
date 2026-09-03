import type { FC } from 'react';
import { Home, PartyPopper, Users } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HouseholdStatus, useMyHouseholdQuery } from '@/entities/household';
import { HouseholdPageState, usePendingHouseholdActivation } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, Surface } from '@/shared/ui';

const HouseholdEntryPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const location = useLocation();
  const query = useMyHouseholdQuery();
  const household = query.data;
  usePendingHouseholdActivation();

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
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={handleBack} title={t('entry.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
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
              <Surface className="mt-2 overflow-hidden" material="raised">
                <IllustratedEmptyState
                  description={t('entry.noneDescription')}
                  icon={<Home className="text-primary-deep" size={38} strokeWidth={1.8} />}
                  testId="household-entry-empty"
                  title={t('entry.none')}
                />
                <div className="mx-6 mb-6">
                  <button
                    className="h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww"
                    data-testid="household-create"
                    onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_CREATE.getPath())}
                    type="button"
                  >
                    {t('entry.create')}
                  </button>
                  <button
                    className="mt-3 h-[52px] w-full rounded-[18px] border border-solid border-border-primary bg-white/85 text-[14px] font-extrabold text-primary-deep shadow-ww"
                    onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_JOIN.getPath())}
                    type="button"
                  >
                    {t('entry.join')}
                  </button>
                </div>
              </Surface>
            )}

            {household?.status === HouseholdStatus.PENDING_PARTNER && (
              <Surface className="mt-2 overflow-hidden" material="raised">
                <IllustratedEmptyState
                  actionLabel={t('entry.manageInvitation')}
                  description={`${t('entry.pendingDescription')} · ${t('entry.sharedSince', { month: household.sharedStartMonth.slice(0, 7) })}`}
                  icon={<Users className="text-primary-deep" size={38} strokeWidth={1.8} />}
                  onAction={() => navigate(ROUTES_PATH.HOUSEHOLD_INVITATION.getPath(household.id))}
                  title={t('entry.pending')}
                />
              </Surface>
            )}

            {household?.status === HouseholdStatus.DISSOLVED && (
              <Surface className="mt-2 overflow-hidden" material="content">
                <IllustratedEmptyState
                  actionLabel={t('dissolvedState.createAgain')}
                  description={t('dissolvedState.description')}
                  icon={<PartyPopper className="text-primary-deep" size={38} strokeWidth={1.8} />}
                  onAction={() => navigate(ROUTES_PATH.HOUSEHOLD_CREATE.getPath())}
                  title={t('dissolvedState.title')}
                />
                <div className="mx-6 mb-6">
                  <button
                    className="h-11 w-full border-0 bg-transparent text-[12px] font-extrabold text-primary-deep"
                    onClick={() => navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true })}
                    type="button"
                  >
                    {t('dissolvedState.backToBills')}
                  </button>
                </div>
              </Surface>
            )}
          </HouseholdPageState>
        </div>
      </main>
    </div>
  );
};

export default HouseholdEntryPage;
