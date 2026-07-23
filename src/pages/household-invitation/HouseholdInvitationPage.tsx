import type { FC } from 'react';
import type { HouseholdInvitation } from '@/entities/household';
import { Button, Dialog, Toast } from 'antd-mobile';
import { Copy, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCachedHouseholdInvitation,
  useCreateHouseholdInvitationMutation,
  useRevokeHouseholdInvitationMutation,
} from '@/entities/household';
import {
  formatCountdown,
  getApiErrorMessage,
  HouseholdPageHeader,
  HouseholdScopeBoundary,
} from '@/features/household';
import { useTranslation } from '@/shared/i18n';

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `household-invite-${Date.now()}`;
}

const HouseholdInvitationPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  const cachedInvitation = useCachedHouseholdInvitation(householdId);
  const [invitation, setInvitation] = useState<HouseholdInvitation | undefined>(cachedInvitation);
  const [consent, setConsent] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [createInvitation, createState] = useCreateHouseholdInvitationMutation();
  const [revokeInvitation, revokeState] = useRevokeHouseholdInvitationMutation();
  const submittingRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = invitation ? new Date(invitation.expiresAt).getTime() - now : 0;

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

  const handleCopy = async () => {
    if (!invitation)
      return;
    await navigator.clipboard?.writeText(invitation.code);
    void Toast.show({ content: t('invitation.copied'), icon: 'success' });
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
    <div className="page-new household-shell overflow-hidden">
      <HouseholdPageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('common.title')}
      />
      <main className="min-h-0 flex-grow overflow-auto px-4 py-7">
        <HouseholdScopeBoundary allowPending householdId={householdId}>
          {() => (
            <div>
              <p className="mb-7 text-center text-[15px] font-medium text-[#44454a]">
                {t('invitation.heading')}
              </p>
              <section className="household-ticket">
                {invitation && remaining > 0
                  ? (
                      <>
                        <div className="household-ticket__eyebrow">{t('invitation.title')}</div>
                        <div className="household-ticket__code">
                          {invitation.code}
                        </div>
                        <p className="household-ticket__expiry">
                          {t('invitation.expiresIn', { countdown: formatCountdown(remaining) })}
                        </p>
                        <div className="household-ticket__actions">
                          <button className="household-ticket-action" onClick={() => void handleCopy()} type="button">
                            <span className="household-ticket-action__icon">
                              <Copy aria-hidden="true" size={23} />
                            </span>
                            {t('invitation.copy')}
                          </button>
                          <button
                            className="household-ticket-action"
                            onClick={() => { void Toast.show({ content: t('invitation.sharePlaceholder') }); }}
                            type="button"
                          >
                            <span className="household-ticket-action__icon household-ticket-action__icon--share">
                              <MessageCircle aria-hidden="true" size={24} />
                            </span>
                            {t('invitation.share')}
                          </button>
                        </div>
                        <div className="mt-10 border-0 border-t border-dashed border-[#ececef] pt-6">
                          <Button
                            fill="none"
                            loading={revokeState.isLoading}
                            onClick={() => void handleRevoke()}
                          >
                            {t('invitation.revoke')}
                          </Button>
                        </div>
                      </>
                    )
                  : (
                      <>
                        <div className="household-ticket__eyebrow">{t('invitation.title')}</div>
                        {invitation && <p className="mt-5 text-sm text-rose-500">{t('invitation.expired')}</p>}
                        <p className="mx-auto mt-5 max-w-[300px] text-sm leading-6 text-[#9b9ca1]">
                          {t('invitation.description')}
                        </p>
                        <label className="household-consent mt-8 text-left">
                          <input
                            checked={consent}
                            onChange={event => setConsent(event.target.checked)}
                            type="checkbox"
                          />
                          <span>{t('invitation.consent')}</span>
                        </label>
                        <Button
                          block
                          className="household-primary-button mt-7"
                          data-testid="household-generate-invite"
                          disabled={createState.isLoading}
                          loading={createState.isLoading}
                          onClick={() => void handleGenerate()}
                        >
                          {invitation ? t('invitation.regenerate') : t('invitation.generate')}
                        </Button>
                      </>
                    )}
              </section>
            </div>
          )}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdInvitationPage;
