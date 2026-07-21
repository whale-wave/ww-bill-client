import type { FC } from 'react';
import { Avatar, Button, ErrorBlock, Toast } from 'antd-mobile';
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
import { NavBar } from '@/shared/ui';

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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('invitation.previewTitle')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        {!code
          ? <ErrorBlock status="default" title={t('join.invalidCode')} />
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
                  <section className="card-rounded bg-white px-4 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar src={query.data.creator.avatar || ''} style={{ '--size': '52px' }} />
                      <div>
                        <span className="block text-xs text-font-gray">{t('invitation.inviter')}</span>
                        <strong className="mt-1 block text-base text-font-black">{getDisplayName(query.data.creator)}</strong>
                      </div>
                    </div>
                    <div className="mt-5 border-0 border-t border-solid border-[#EBEBEB] pt-4">
                      <span className="block text-xs text-font-gray">{t('invitation.sharedStart')}</span>
                      <strong className="mt-1 block text-base text-font-black">{query.data.sharedStartMonth.slice(0, 7)}</strong>
                    </div>
                    <label className="mt-5 block text-sm text-font-black">
                      <span className="mb-2 block">{t('invitation.nickname')}</span>
                      <input
                        className="h-12 w-full rounded-xl border-0 bg-bg-gray px-3 text-base outline-none"
                        maxLength={30}
                        onChange={event => setNickname(event.target.value)}
                        placeholder={t('invitation.nicknamePlaceholder')}
                        value={nickname}
                      />
                    </label>
                    <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-font-black">
                      <input
                        checked={consent}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
                        onChange={event => setConsent(event.target.checked)}
                        type="checkbox"
                      />
                      <span>{t('invitation.acceptConsent')}</span>
                    </label>
                    <Button
                      block
                      className="mt-7"
                      color="primary"
                      data-testid="household-accept"
                      disabled={mutation.isLoading}
                      loading={mutation.isLoading}
                      onClick={() => void handleAccept()}
                      size="large"
                    >
                      {t('invitation.accept')}
                    </Button>
                  </section>
                )}
              </HouseholdPageState>
            )}
      </main>
    </div>
  );
};

export default HouseholdInvitationPreviewPage;
