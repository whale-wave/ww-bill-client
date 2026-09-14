import type { FC } from 'react';
import { CalendarDays, CircleAlert, UserRound } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAcceptHouseholdInvitationMutation,
  useHouseholdInvitationPreviewQuery,
} from '@/entities/household';
import {
  getApiErrorMessage,
  getApiErrorStatus,
  getDisplayName,
  HouseholdPageState,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppButton, IllustratedEmptyState, PageHeader, Surface, UserAvatar } from '@/shared/ui';
import { showAppError, showAppNotice } from '@/shared/ui/app-feedback';
import { Checkbox, Input } from '@/shared/ui/konsta-compat';

const HouseholdInvitationPreviewPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { code = '' } = useParams<{ code: string }>();
  const query = useHouseholdInvitationPreviewQuery({
    params: { code },
    queryOptions: { enabled: Boolean(code) },
  });
  const [nickname, setNickname] = useState('');
  const [consent, setConsent] = useState(false);
  const [accept, mutation] = useAcceptHouseholdInvitationMutation();
  const submittingRef = useRef(false);

  const handleAccept = async () => {
    if (!consent) {
      void showAppNotice({ content: t('invitation.consentRequired') });
      return;
    }
    if (!code || !query.data || submittingRef.current)
      return;

    submittingRef.current = true;
    try {
      const response = await accept({
        code,
        data: {
          expectedHouseholdVersion: query.data.householdVersion,
          expectedSharedStartMonth: query.data.sharedStartMonth,
          ...(nickname.trim() ? { nickname: nickname.trim() } : {}),
          sharingConsentConfirmed: true,
        },
      });
      navigate(ROUTES_PATH.HOUSEHOLD_HOME.getPath(response.data.id), { replace: true });
    }
    catch (error) {
      if (getApiErrorStatus(error) === 409) {
        setConsent(false);
        await query.refetch();
        void showAppError({ content: t('invitation.previewChanged'), icon: 'fail' });
        return;
      }
      void showAppError({
        content: getApiErrorMessage(error, t('invitation.acceptFailed')),
        icon: 'fail',
      });
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('invitation.previewTitle')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          {!code
            ? (
                <div className="flex min-h-[360px] items-center justify-center">
                  <Surface className="w-full overflow-hidden" material="content">
                    <IllustratedEmptyState
                      actionLabel={t('common:nav.back')}
                      icon={<CircleAlert className="text-primary-deep" size={38} strokeWidth={1.8} />}
                      onAction={() => navigate(-1)}
                      title={t('join.invalidCode')}
                    />
                  </Surface>
                </div>
              )
            : (
                <HouseholdPageState
                  errorDescription={t('common.loadErrorDescription')}
                  errorTitle={t('common.loadError')}
                  isError={query.isError}
                  isLoading={query.isLoading}
                  loadingLabel={t('common.loading')}
                  onRetry={() => void query.refetch()}
                  retryLabel={t('common.retry')}
                >
                  {query.data && (
                    <>
                      <Surface className="mt-2 px-5 py-5" material="raised">
                        <div className="flex items-center gap-3">
                          <UserAvatar alt={getDisplayName(query.data.creator)} name={getDisplayName(query.data.creator)} size={52} src={query.data.creator.avatar} />
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold text-ww-soft">{t('invitation.inviter')}</span>
                            <strong className="mt-0.5 block truncate text-[16px] font-extrabold text-ww-ink">{getDisplayName(query.data.creator)}</strong>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3 rounded-[15px] border border-white/70 bg-white/60 px-3.5 py-3">
                          <CalendarDays className="text-primary-deep" size={19} strokeWidth={1.8} />
                          <div className="min-w-0 flex-1">
                            <span className="block text-[11px] font-bold text-ww-soft">{t('invitation.sharedStart')}</span>
                            <strong className="mt-0.5 block font-number text-[15px] font-extrabold text-ww-ink">{query.data.sharedStartMonth.slice(0, 7)}</strong>
                          </div>
                        </div>
                      </Surface>

                      <Surface className="mt-4 px-5 py-5" material="content">
                        <label className="block min-w-0">
                          <span className="mb-2 block text-[12px] font-bold leading-[18px] text-ww-mid">{t('invitation.nickname')}</span>
                          <div className="flex min-h-[54px] items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww">
                            <UserRound className="text-primary-deep" size={20} strokeWidth={1.8} />
                            <Input
                              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ww-ink outline-none placeholder:text-ww-soft"
                              maxLength={30}
                              onChange={setNickname}
                              placeholder={t('invitation.nicknamePlaceholder')}
                              value={nickname}
                            />
                          </div>
                        </label>
                        <Checkbox
                          className="mt-5 flex items-start gap-3 rounded-[15px] bg-primary-light/25 px-3.5 py-3 text-[12px] font-bold leading-5 text-ww-ink"
                          checked={consent}
                          onChange={setConsent}
                        >
                          <span>{t('invitation.acceptConsent')}</span>
                        </Checkbox>
                        <AppButton
                          className="mt-6"
                          data-testid="household-accept"
                          fullWidth
                          loading={mutation.isLoading}
                          loadingLabel={t('invitation.accepting')}
                          onClick={() => void handleAccept()}
                        >
                          {t('invitation.accept')}
                        </AppButton>
                      </Surface>
                    </>
                  )}
                </HouseholdPageState>
              )}
        </div>
      </main>
    </div>
  );
};

export default HouseholdInvitationPreviewPage;
