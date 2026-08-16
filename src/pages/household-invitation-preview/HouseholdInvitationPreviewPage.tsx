import type { FC } from 'react';
import { Avatar, ErrorBlock, Toast } from 'antd-mobile';
import { CalendarDays, UserRound } from 'lucide-react';
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
import { GradientPanel, PageHeader } from '@/shared/ui';

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
      void Toast.show({ content: t('invitation.consentRequired') });
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
      void Toast.show({ content: t('invitation.accepted'), icon: 'success' });
      navigate(ROUTES_PATH.HOUSEHOLD_HOME.getPath(response.data.id), { replace: true });
    }
    catch (error) {
      if (getApiErrorStatus(error) === 409) {
        setConsent(false);
        await query.refetch();
        void Toast.show({ content: t('invitation.previewChanged'), icon: 'fail' });
        return;
      }
      void Toast.show({
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
                  <ErrorBlock status="default" title={t('join.invalidCode')} />
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
                      <GradientPanel className="mt-2 px-5 py-5" elevation="low" surface="ice">
                        <div className="flex items-center gap-3">
                          <Avatar src={query.data.creator.avatar || ''} style={{ '--size': '52px' }} />
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
                      </GradientPanel>

                      <GradientPanel className="mt-4 px-5 py-5" elevation="low" surface="glass">
                        <label className="block min-w-0">
                          <span className="mb-2 block text-[12px] font-bold leading-[18px] text-ww-mid">{t('invitation.nickname')}</span>
                          <span className="flex min-h-[54px] items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 shadow-ww-xs transition focus-within:border-primary-mid focus-within:shadow-ww">
                            <UserRound className="text-primary-deep" size={20} strokeWidth={1.8} />
                            <input
                              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ww-ink outline-none placeholder:text-ww-soft"
                              maxLength={30}
                              onChange={event => setNickname(event.target.value)}
                              placeholder={t('invitation.nicknamePlaceholder')}
                              value={nickname}
                            />
                          </span>
                        </label>
                        <label className="mt-5 flex items-start gap-3 rounded-[15px] bg-primary-light/25 px-3.5 py-3 text-[12px] font-bold leading-5 text-ww-ink">
                          <input
                            checked={consent}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
                            onChange={event => setConsent(event.target.checked)}
                            type="checkbox"
                          />
                          <span>{t('invitation.acceptConsent')}</span>
                        </label>
                        <button
                          className="mt-6 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
                          data-testid="household-accept"
                          disabled={mutation.isLoading}
                          onClick={() => void handleAccept()}
                          type="button"
                        >
                          {mutation.isLoading ? t('invitation.accepting') : t('invitation.accept')}
                        </button>
                      </GradientPanel>
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
