import type { FC } from 'react';
import type { LedgerInvitation } from '@/entities/ledger';
import { Button, Checkbox, Toast } from 'antd-mobile';
import { ContentOutline, MessageOutline } from 'antd-mobile-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  useCreateInvitationMutation,
  useLedgerQuery,
  useRevokeInvitationMutation,
} from '@/entities/ledger';
import {
  CollaborationQueryState,
  createIdempotencyKey,
  formatCountdown,
  getErrorMessage,
} from '@/features/ledger-collaboration';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const LedgerInvitePage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const [createInvitation, createState] = useCreateInvitationMutation();
  const [revokeInvitation, revokeState] = useRevokeInvitationMutation();
  const [consented, setConsented] = useState(false);
  const [invitation, setInvitation] = useState<LedgerInvitation>();
  const [countdown, setCountdown] = useState('00:00:00');
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!invitation)
      return;
    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(invitation.expiresAt));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [invitation]);

  const canInvite = ledgerQuery.data?.capabilities.includes(
    LedgerCapability.MEMBER_INVITE,
  );

  const handleGenerate = async () => {
    if (!ledgerId || !consented || submittingRef.current)
      return;
    submittingRef.current = true;
    try {
      const response = await createInvitation({
        data: {
          idempotencyKey: createIdempotencyKey('ledger-invite'),
          sharingConsentConfirmed: true,
        },
        ledgerId,
      });
      setInvitation(response.data);
      setCountdown(formatCountdown(response.data.expiresAt));
      Toast.show({ content: t('invite.generated'), icon: 'success' });
    }
    catch (error) {
      Toast.show({ content: getErrorMessage(error, t('invite.generateFailed')) });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleRevoke = async () => {
    if (!invitation || submittingRef.current)
      return;
    submittingRef.current = true;
    try {
      await revokeInvitation({ invitationId: invitation.id, ledgerId });
      setInvitation(undefined);
      setCountdown('00:00:00');
      Toast.show({ content: t('invite.revoked'), icon: 'success' });
    }
    catch (error) {
      Toast.show({ content: getErrorMessage(error, t('invite.revokeFailed')) });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleCopy = async () => {
    if (!invitation)
      return;
    try {
      await navigator.clipboard.writeText(invitation.code);
      Toast.show({ content: t('invite.copied'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('invite.copyFailed') });
    }
  };

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('invite.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-6">
        {!ledgerId && (
          <CollaborationQueryState
            description={t('common.invalidLedgerDescription')}
            title={t('common.invalidLedger')}
            type="invalid"
          />
        )}
        {ledgerId && ledgerQuery.isLoading && (
          <CollaborationQueryState title={t('common.loading')} type="loading" />
        )}
        {ledgerId && ledgerQuery.isError && (
          <CollaborationQueryState
            description={t('common.loadErrorDescription')}
            onRetry={() => ledgerQuery.refetch()}
            retryLabel={t('common.retry')}
            title={t('common.loadError')}
            type="error"
          />
        )}
        {ledgerQuery.data && !canInvite && (
          <CollaborationQueryState
            description={t('common.noPermissionDescription')}
            title={t('common.noPermission')}
            type="permission"
          />
        )}
        {ledgerQuery.data && canInvite && (
          <div className="mx-3 mt-3 card-rounded bg-white px-4 py-6">
            <h1 className="text-center text-xl font-medium text-font-black">
              {invitation ? t('invite.codeTitle') : t('invite.generateTitle')}
            </h1>
            {!invitation
              ? (
                  <>
                    <p className="mt-3 text-center text-sm leading-6 text-font-gray">
                      {t('invite.description')}
                    </p>
                    <label
                      className="mt-8 flex items-start gap-2 text-sm leading-6 text-font-black"
                      data-testid="invite-consent"
                    >
                      <Checkbox checked={consented} onChange={setConsented} />
                      <span>{t('invite.consent')}</span>
                    </label>
                    <Button
                      block
                      className="mt-6"
                      color="primary"
                      data-testid="generate-invitation"
                      disabled={!consented || createState.isLoading}
                      loading={createState.isLoading}
                      onClick={handleGenerate}
                    >
                      {t('invite.generate')}
                    </Button>
                  </>
                )
              : (
                  <>
                    <div className="mt-6 rounded bg-bg-gray px-3 py-4 text-center text-3xl font-medium tracking-[0.18em] text-font-black">
                      {invitation.code}
                    </div>
                    <p className="mt-3 text-center text-sm text-font-gray">
                      {t('invite.expiresIn', { countdown })}
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Button fill="outline" onClick={handleCopy}>
                        <ContentOutline className="mr-2" />
                        {t('invite.copy')}
                      </Button>
                      <Button
                        fill="outline"
                        onClick={() => {
                          Toast.show(t('invite.wechatPlaceholder'));
                        }}
                      >
                        <MessageOutline className="mr-2" />
                        {t('invite.wechat')}
                      </Button>
                    </div>
                    <Button
                      block
                      className="mt-5"
                      color="primary"
                      disabled={createState.isLoading || revokeState.isLoading}
                      loading={createState.isLoading}
                      onClick={handleGenerate}
                    >
                      {t('invite.regenerate')}
                    </Button>
                    <Button
                      block
                      className="mt-3"
                      color="danger"
                      fill="none"
                      disabled={createState.isLoading || revokeState.isLoading}
                      loading={revokeState.isLoading}
                      onClick={handleRevoke}
                    >
                      {t('invite.revoke')}
                    </Button>
                  </>
                )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LedgerInvitePage;
