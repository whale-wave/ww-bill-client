import type { FC } from 'react';
import type { HouseholdInvitation } from '@/entities/household';
import { Button, Dialog, Toast } from 'antd-mobile';
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
import { NavBar } from '@/shared/ui';

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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('invitation.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdScopeBoundary allowPending householdId={householdId}>
          {() => (
            <section className="card-rounded bg-white px-4 py-6 text-center">
              <h1 className="text-lg font-medium text-font-black">{t('invitation.heading')}</h1>
              <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-font-gray">{t('invitation.description')}</p>

              {invitation && remaining > 0
                ? (
                    <div className="mt-7">
                      <div className="rounded-xl bg-bg-gray px-3 py-4 text-3xl font-medium tracking-[0.18em] text-font-black">
                        {invitation.code}
                      </div>
                      <p className="mt-2 text-xs text-font-gray">
                        {t('invitation.expiresIn', { countdown: formatCountdown(remaining) })}
                      </p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Button onClick={() => void handleCopy()}>
                          <span className="flex items-center justify-center gap-2">
                            <Copy size={16} />
                            {t('invitation.copy')}
                          </span>
                        </Button>
                        <Button onClick={() => void handleShare()}>
                          <span className="flex items-center justify-center gap-2">
                            <Share2 size={16} />
                            {t('invitation.share')}
                          </span>
                        </Button>
                      </div>
                      <Button
                        block
                        className="mt-3"
                        color="danger"
                        fill="none"
                        loading={revokeState.isLoading}
                        onClick={() => void handleRevoke()}
                      >
                        {t('invitation.revoke')}
                      </Button>
                    </div>
                  )
                : (
                    <div className="mt-7">
                      {invitation && <p className="mb-4 text-sm text-rose-500">{t('invitation.expired')}</p>}
                      <label className="flex items-start gap-3 text-left text-sm leading-6 text-font-black">
                        <input
                          checked={consent}
                          className="mt-1 h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
                          onChange={event => setConsent(event.target.checked)}
                          type="checkbox"
                        />
                        <span>{t('invitation.consent')}</span>
                      </label>
                      <Button
                        block
                        className="mt-5"
                        color="primary"
                        data-testid="household-generate-invite"
                        disabled={createState.isLoading}
                        loading={createState.isLoading}
                        onClick={() => void handleGenerate()}
                        size="large"
                      >
                        {invitation ? t('invitation.regenerate') : t('invitation.generate')}
                      </Button>
                    </div>
                  )}
            </section>
          )}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdInvitationPage;
