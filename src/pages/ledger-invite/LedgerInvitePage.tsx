import type { FC } from 'react';
import type { LedgerInvitation } from '@/entities/ledger';
import { Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { Copy, Share2, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LedgerCapability,
  readLedgerInvitation,
  removeLedgerInvitation,
  useCreateInvitationMutation,
  useLedgerQuery,
  useRevokeInvitationMutation,
  writeLedgerInvitation,
} from '@/entities/ledger';
import {
  CollaborationQueryState,
  createIdempotencyKey,
  formatCountdown,
  getErrorMessage,
} from '@/features/ledger-collaboration';
import {
  useWorkspaceBack,
} from '@/features/workspace-navigation';
import { captureSessionScope, isSessionScopeCurrent } from '@/shared/api/auth-injection';
import { useTranslation } from '@/shared/i18n';
import { confirmAppAction, GradientPanel, PageHeader } from '@/shared/ui';

function isShareCancelError(error: unknown) {
  if (typeof error !== 'object' || error === null)
    return false;
  const candidate = error as { name?: string; message?: string };
  return candidate.name === 'AbortError'
    || candidate.name === 'NotAllowedError'
    || (typeof candidate.message === 'string'
      && (candidate.message.includes('AbortError') || candidate.message.includes('cancel')));
}

const LedgerInvitePage: FC = () => {
  const { t } = useTranslation('ledger');
  const { ledgerId = '' } = useParams<{ ledgerId: string }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const [createInvitation, createState] = useCreateInvitationMutation();
  const [revokeInvitation, revokeState] = useRevokeInvitationMutation();
  const [consented, setConsented] = useState(false);
  const [invitation, setInvitation] = useState<LedgerInvitation | undefined>(
    () => readLedgerInvitation(ledgerId) ?? undefined,
  );
  const [now, setNow] = useState(() => Date.now());
  const submittingRef = useRef(false);
  const onBack = useWorkspaceBack({
    capabilities: ledgerQuery.data?.capabilities,
    ledgerId,
    type: 'custom',
  });

  useEffect(() => {
    const scope = captureSessionScope();
    const timer = window.setInterval(() => {
      if (!isSessionScopeCurrent(scope))
        return;
      setNow(Date.now());
      if (invitation && new Date(invitation.expiresAt).getTime() <= Date.now()) {
        removeLedgerInvitation(ledgerId);
        setConsented(false);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [invitation, ledgerId]);

  const remaining = invitation
    ? new Date(invitation.expiresAt).getTime() - now
    : 0;

  const canInvite = ledgerQuery.data?.capabilities.includes(
    LedgerCapability.MEMBER_INVITE,
  );

  const handleGenerate = async () => {
    if (!ledgerId || !consented || submittingRef.current)
      return;
    submittingRef.current = true;
    const scope = captureSessionScope();
    try {
      const response = await createInvitation({
        data: {
          idempotencyKey: createIdempotencyKey('ledger-invite'),
          sharingConsentConfirmed: true,
        },
        ledgerId,
      });
      if (!isSessionScopeCurrent(scope))
        return;
      setInvitation(response.data);
      writeLedgerInvitation(ledgerId, response.data);
      setNow(Date.now());
      setConsented(false);
      Toast.show({ content: t('invite.generated'), icon: 'success' });
    }
    catch (error) {
      if (isSessionScopeCurrent(scope))
        Toast.show({ content: getErrorMessage(error, t('invite.generateFailed')) });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const handleRevoke = async () => {
    if (!invitation || submittingRef.current)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common.cancel'),
      confirmText: t('invite.revoke'),
      description: t('invite.revokeConfirmDescription'),
      icon: <Users size={22} strokeWidth={1.8} />,
      title: t('invite.revokeConfirmTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    submittingRef.current = true;
    const scope = captureSessionScope();
    try {
      await revokeInvitation({ invitationId: invitation.id, ledgerId });
      if (!isSessionScopeCurrent(scope))
        return;
      setInvitation(undefined);
      removeLedgerInvitation(ledgerId);
      setConsented(false);
      Toast.show({ content: t('invite.revoked'), icon: 'success' });
    }
    catch (error) {
      if (isSessionScopeCurrent(scope))
        Toast.show({ content: getErrorMessage(error, t('invite.revokeFailed')) });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const copyText = async (text: string, successKey: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        Toast.show({ content: t(successKey), icon: 'success' });
        return;
      }
      if (copy(text))
        Toast.show({ content: t(successKey), icon: 'success' });
      else
        Toast.show({ content: t('invite.copyFailed'), icon: 'fail' });
    }
    catch {
      if (copy(text))
        Toast.show({ content: t(successKey), icon: 'success' });
      else
        Toast.show({ content: t('invite.copyFailed'), icon: 'fail' });
    }
  };

  const handleCopy = async () => {
    if (!invitation)
      return;
    await copyText(invitation.code, 'invite.copied');
  };

  const handleShare = async () => {
    if (!invitation)
      return;
    const text = t('invite.shareText', {
      code: invitation.code,
      name: ledgerQuery.data?.name ?? '',
    });
    try {
      if (navigator.share) {
        await navigator.share({ text, title: t('invite.title') });
        return;
      }
      await copyText(text, 'invite.shareCopied');
    }
    catch (error) {
      if (isShareCancelError(error))
        return;
      await copyText(text, 'invite.shareCopied');
    }
  };

  const hasActiveCode = invitation && remaining > 0;

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        subtitle={t('invite.subtitle')}
        title={t('invite.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
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
            <>
              <GradientPanel className="mt-2 px-5 py-6 text-center" elevation="low" surface="ice">
                <span className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-white/75 text-primary-deep shadow-ww-xs">
                  <Users size={26} strokeWidth={1.8} />
                </span>
                <h1 className="mt-3 text-[16px] font-extrabold text-ww-ink">{t('invite.heading')}</h1>
                <p className="mx-auto mt-2 max-w-[300px] text-[12px] font-semibold leading-5 text-ww-mid">{t('invite.description')}</p>

                {hasActiveCode
                  ? (
                      <div className="mt-6">
                        <div className="rounded-[18px] border border-white/80 bg-white/85 px-3 py-5 shadow-ww-xs backdrop-blur-xl">
                          <span
                            className="block font-number text-[34px] font-black tracking-[0.18em] text-ww-ink"
                            data-testid="ledger-invite-code"
                          >
                            {invitation?.code}
                          </span>
                          <p className="mt-2 text-[12px] font-bold text-ww-mid">
                            {t('invite.expiresIn', { countdown: formatCountdown(invitation.expiresAt, now) })}
                          </p>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border-0 bg-primary text-[13px] font-extrabold text-white shadow-ww-xs"
                            data-testid="ledger-invite-copy"
                            onClick={() => void handleCopy()}
                            type="button"
                          >
                            <Copy size={16} />
                            {t('invite.copy')}
                          </button>
                          <button
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white/85 text-[13px] font-extrabold text-primary-deep shadow-ww-xs"
                            data-testid="ledger-invite-share"
                            onClick={() => void handleShare()}
                            type="button"
                          >
                            <Share2 size={16} />
                            {t('invite.share')}
                          </button>
                        </div>
                        <p className="mt-4 text-[12px] font-semibold text-ww-mid">{t('invite.waiting')}</p>
                        <button
                          className="mt-3 h-11 w-full border-0 bg-transparent text-[12px] font-extrabold text-[#b24f71] disabled:opacity-45"
                          data-testid="ledger-invite-revoke"
                          disabled={revokeState.isLoading}
                          onClick={() => void handleRevoke()}
                          type="button"
                        >
                          {revokeState.isLoading ? t('invite.revoking') : t('invite.revoke')}
                        </button>
                      </div>
                    )
                  : (
                      <div className="mt-6">
                        {invitation && (
                          <div className="mb-4 rounded-[15px] bg-[#fff1f0]/80 px-3.5 py-3 text-left">
                            <p className="text-[13px] font-bold text-[#b24f71]">{t('invite.expired')}</p>
                            <p className="mt-1 text-[11px] font-semibold leading-4 text-ww-mid">
                              {t('invite.expiredDescription')}
                            </p>
                          </div>
                        )}
                        <label
                          className="flex items-start gap-3 rounded-[15px] bg-primary-light/25 px-3.5 py-3 text-left text-[12px] font-bold leading-5 text-ww-ink"
                          data-testid="invite-consent"
                        >
                          <input
                            checked={consented}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
                            onChange={event => setConsented(event.target.checked)}
                            type="checkbox"
                          />
                          <span>{t('invite.consent')}</span>
                        </label>
                        <button
                          className="mt-5 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
                          data-testid="generate-invitation"
                          disabled={!consented || createState.isLoading}
                          onClick={() => void handleGenerate()}
                          type="button"
                        >
                          {createState.isLoading
                            ? t('invite.submitting')
                            : invitation
                              ? t('invite.regenerate')
                              : t('invite.generate')}
                        </button>
                        <p className="mt-4 text-[11px] font-semibold text-ww-soft">{t('invite.validFor')}</p>
                      </div>
                    )}
              </GradientPanel>

              <GradientPanel className="mt-4 px-5 py-5" elevation="low" surface="glass">
                <h2 className="text-[13px] font-extrabold text-ww-ink">{t('invite.howToJoin')}</h2>
                <ol className="mt-3 space-y-2.5">
                  {[1, 2, 3, 4, 5].map(step => (
                    <li className="flex items-start gap-2.5 text-[12px] font-semibold leading-5 text-ww-mid" key={step}>
                      <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary-light/65 text-[10px] font-black text-primary-deep">
                        {step}
                      </span>
                      {t(`invite.step${step}`)}
                    </li>
                  ))}
                </ol>
              </GradientPanel>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LedgerInvitePage;
