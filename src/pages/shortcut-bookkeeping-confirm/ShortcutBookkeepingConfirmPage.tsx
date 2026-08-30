import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClaimShortcutDraftMutation } from '@/entities/shortcut-bookkeeping';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppButton, PageLoadingState } from '@/shared/ui';

function isTerminalShortcutDraftError(error: unknown, includeNotFound = false) {
  if (!error || typeof error !== 'object' || !('statusCode' in error))
    return false;
  const statusCode = Number(error.statusCode);
  return statusCode === 409
    || statusCode === 410
    || (includeNotFound && statusCode === 404);
}

function readHandoffCode(key: string) {
  try {
    return sessionStorage.getItem(key) ?? '';
  }
  catch {
    return '';
  }
}

function storeHandoffCode(key: string, code: string) {
  try {
    sessionStorage.setItem(key, code);
  }
  catch {
    // The page can still complete without refresh recovery when storage is blocked.
  }
}

function removeHandoffCode(key: string) {
  try {
    sessionStorage.removeItem(key);
  }
  catch {
    // Storage may be unavailable in a restricted browser context.
  }
}

export default function ShortcutBookkeepingConfirmPage() {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId') ?? '';
  const urlHandoffCode = searchParams.get('code') ?? '';
  const handoffStorageKey = `ww-shortcut-handoff:${draftId}`;
  const [handoffCode] = useState(() => {
    if (!draftId)
      return '';
    if (urlHandoffCode) {
      storeHandoffCode(handoffStorageKey, urlHandoffCode);
      return urlHandoffCode;
    }
    return readHandoffCode(handoffStorageKey);
  });
  const [claimAttempt, setClaimAttempt] = useState(0);
  const claimStartedRef = useRef(false);
  const claimMutation = useClaimShortcutDraftMutation();
  const isLinkValid = Boolean(draftId && handoffCode);

  useEffect(() => {
    if (!isLinkValid || claimStartedRef.current)
      return;
    claimStartedRef.current = true;
    void claimMutation.mutateAsync({ code: handoffCode, draftId })
      .then((draft) => {
        removeHandoffCode(handoffStorageKey);
        navigate(ROUTES_PATH.BOOKKEEPING.getPath(), {
          replace: true,
          state: {
            shortcutBookkeeping: draft,
          },
        });
      })
      .catch((error) => {
        if (isTerminalShortcutDraftError(error, true))
          removeHandoffCode(handoffStorageKey);
      });
  }, [claimAttempt, claimMutation, draftId, handoffCode, handoffStorageKey, isLinkValid, navigate]);

  const handleRetry = useCallback(() => {
    claimMutation.reset();
    claimStartedRef.current = false;
    setClaimAttempt(attempt => attempt + 1);
  }, [claimMutation]);

  if (isLinkValid && !claimMutation.isError)
    return <PageLoadingState label={t('common:nav.loading')} testId="shortcut-draft-loading" />;

  const errorMessage = !isLinkValid
    ? t('settings:shortcutBookkeeping.invalidLink')
    : t('settings:shortcutBookkeeping.loadFailed');

  return (
    <main className="page-new flex min-h-0 flex-grow items-center justify-center px-[18px] pb-12">
      <div className="w-full max-w-[420px] rounded-[20px] border border-border-primary bg-white/[0.88] px-5 py-8 text-center shadow-ww">
        <p className="text-[13px] font-bold leading-6 text-ww-mid">{errorMessage}</p>
        {claimMutation.isError && isLinkValid && (
          <AppButton className="mt-5" fullWidth onClick={handleRetry}>
            {t('common:retry')}
          </AppButton>
        )}
        <AppButton className={claimMutation.isError && isLinkValid ? 'mt-3' : 'mt-5'} fullWidth onClick={() => navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true })} variant="secondary">
          {t('common:nav.back')}
        </AppButton>
      </div>
    </main>
  );
}
