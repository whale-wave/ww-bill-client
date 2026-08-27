import type { FC } from 'react';
import type { HouseholdInvitation } from '@/entities/household';
import { Dialog, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import { Copy, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  readHouseholdInvitation,
  removeHouseholdInvitation,
  useCachedHouseholdInvitation,
  useCreateHouseholdInvitationMutation,
  useRevokeHouseholdInvitationMutation,
} from '@/entities/household';
import {
  formatCountdown,
  getApiErrorMessage,
  HouseholdScopeBoundary,
  usePendingHouseholdActivation,
} from '@/features/household';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `household-invite-${Date.now()}`;
}

function isShareCancelError(error: unknown) {
  if (typeof error !== 'object' || error === null)
    return false;
  const candidate = error as { name?: string; message?: string };
  return candidate.name === 'AbortError'
    || candidate.name === 'NotAllowedError'
    || (typeof candidate.message === 'string'
      && (candidate.message.includes('AbortError') || candidate.message.includes('cancel')));
}

const HouseholdInvitationPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  const cachedInvitation = useCachedHouseholdInvitation(householdId);
  const [invitation, setInvitation] = useState<HouseholdInvitation | undefined>(
    () => readHouseholdInvitation(householdId) ?? cachedInvitation,
  );
  const [consent, setConsent] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [createInvitation, createState] = useCreateHouseholdInvitationMutation();
  const [revokeInvitation, revokeState] = useRevokeHouseholdInvitationMutation();
  const submittingRef = useRef(false);
  usePendingHouseholdActivation();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = invitation ? new Date(invitation.expiresAt).getTime() - now : 0;

  useEffect(() => {
    if (invitation && remaining <= 0)
      removeHouseholdInvitation(householdId);
  }, [householdId, invitation, remaining]);

  const handleGenerate = async () => {
    if (!consent) {
      void Toast.show({ content: t('invitation.consentRequired') });
      return;
    }
    if (!householdId || submittingRef.current)
      return;

    submittingRef.current = true;
    try {
      const response = await createInvitation({
        data: {
          idempotencyKey: createIdempotencyKey(),
          sharingConsentConfirmed: true,
        },
        householdId,
      });
      setInvitation(response.data);
      setNow(Date.now());
      void Toast.show({ content: t('invitation.generated'), icon: 'success' });
    }
    catch (error) {
      void Toast.show({ content: getApiErrorMessage(error, t('common.failed')), icon: 'fail' });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const copyText = async (text: string, successKey: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        void Toast.show({ content: t(successKey), icon: 'success' });
        return;
      }
      if (copy(text))
        void Toast.show({ content: t(successKey), icon: 'success' });
      else
        void Toast.show({ content: t('invitation.copyFailed'), icon: 'fail' });
    }
    catch {
      if (copy(text))
        void Toast.show({ content: t(successKey), icon: 'success' });
      else
        void Toast.show({ content: t('invitation.copyFailed'), icon: 'fail' });
    }
  };

  const handleCopy = async () => {
    if (!invitation)
      return;
    await copyText(invitation.code, 'invitation.copied');
  };

  const handleShare = async () => {
    if (!invitation)
      return;
    const text = t('invitation.shareText', { code: invitation.code });
    try {
      if (navigator.share) {
        await navigator.share({ text, title: t('invitation.title') });
        return;
      }
      await copyText(text, 'invitation.shareCopied');
    }
    catch (error) {
      if (isShareCancelError(error))
        return;
      await copyText(text, 'invitation.shareCopied');
    }
  };

  const handleRevoke = async () => {
    if (!invitation)
      return;
    const confirmed = await Dialog.confirm({ content: t('invitation.confirmRevoke') });
    if (!confirmed)
      return;
    try {
      await revokeInvitation({ householdId, invitationId: invitation.id });
      setInvitation(undefined);
      void Toast.show({ content: t('invitation.revoked'), icon: 'success' });
    }
    catch (error) {
      void Toast.show({ content: getApiErrorMessage(error, t('common.failed')), icon: 'fail' });
    }
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('invitation.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          <HouseholdScopeBoundary allowPending householdId={householdId}>
            {household => (
              <GradientPanel className="mt-2 px-5 py-6 text-center" elevation="low" surface="ice">
                <h1 className="text-[16px] font-extrabold text-ww-ink">{t('invitation.heading')}</h1>
                <p className="mx-auto mt-2 max-w-[300px] text-[12px] font-semibold leading-5 text-ww-mid">{t('invitation.description')}</p>
                <p className="mt-2 text-[12px] font-bold text-primary-deep">{t('invitation.remaining', { count: Math.max(0, (household.memberLimit ?? 12) - (household.memberCount ?? household.members.length)) })}</p>

                {invitation && remaining > 0
                  ? (
                      <div className="mt-6">
                        <div className="rounded-[18px] border border-white/80 bg-white/85 px-3 py-5 shadow-ww-xs backdrop-blur-xl">
                          <span className="block font-number text-[34px] font-black tracking-[0.18em] text-ww-ink">
                            {invitation.code}
                          </span>
                          <p className="mt-2 text-[12px] font-bold text-ww-mid">
                            {t('invitation.expiresIn', { countdown: formatCountdown(remaining) })}
                          </p>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border-0 bg-primary text-[13px] font-extrabold text-white shadow-ww-xs"
                            onClick={() => void handleCopy()}
                            type="button"
                          >
                            <Copy size={16} />
                            {t('invitation.copy')}
                          </button>
                          <button
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white/85 text-[13px] font-extrabold text-primary-deep shadow-ww-xs"
                            onClick={() => void handleShare()}
                            type="button"
                          >
                            <Share2 size={16} />
                            {t('invitation.share')}
                          </button>
                        </div>
                        <p className="mt-4 text-[12px] font-semibold text-ww-mid">{t('invitation.waiting')}</p>
                        <button
                          className="mt-3 h-11 w-full border-0 bg-transparent text-[12px] font-extrabold text-[#b24f71] disabled:opacity-45"
                          disabled={revokeState.isLoading}
                          onClick={() => void handleRevoke()}
                          type="button"
                        >
                          {revokeState.isLoading ? t('invitation.revoking') : t('invitation.revoke')}
                        </button>
                      </div>
                    )
                  : (
                      <div className="mt-6">
                        {invitation && <p className="mb-4 text-[13px] font-bold text-[#c04870]">{t('invitation.expired')}</p>}
                        <label className="flex items-start gap-3 rounded-[15px] bg-primary-light/25 px-3.5 py-3 text-left text-[12px] font-bold leading-5 text-ww-ink">
                          <input
                            checked={consent}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
                            onChange={event => setConsent(event.target.checked)}
                            type="checkbox"
                          />
                          <span>{t('invitation.consent')}</span>
                        </label>
                        <button
                          className="mt-5 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
                          data-testid="household-generate-invite"
                          disabled={createState.isLoading || (household.memberCount ?? household.members.length) >= (household.memberLimit ?? 12)}
                          onClick={() => void handleGenerate()}
                          type="button"
                        >
                          {createState.isLoading
                            ? t('invitation.submitting')
                            : invitation
                              ? t('invitation.regenerate')
                              : t('invitation.generate')}
                        </button>
                      </div>
                    )}
              </GradientPanel>
            )}
          </HouseholdScopeBoundary>
        </div>
      </main>
    </div>
  );
};

export default HouseholdInvitationPage;
