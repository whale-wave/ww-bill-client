import type { FC, ReactNode } from 'react';
import type { UserAppConfig } from '@/entities/user-app-config';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  isAppLockTemporarilyLocked,
  isTooSimplePattern,
  localAppLockStorage,
  PatternGesture,
  recordAppLockFailure,
  verifyAppLockPattern,
} from '@/entities/app-lock';
import { useTranslation } from '@/shared/i18n';
import { AppButton, PageLoadingState } from '@/shared/ui';

interface AppLockGuardProps {
  children: ReactNode;
  config?: UserAppConfig;
  isError: boolean;
  isLoading: boolean;
  token: string;
}

export const AppLockGuard: FC<AppLockGuardProps> = ({
  children,
  config,
  isError,
  isLoading,
  token,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('settings');
  const userId = config?.userId;
  const [pattern, setPattern] = useState<number[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const patternRef = useRef<number[]>([]);
  const isSubmittingRef = useRef(false);
  const lockVersionRef = useRef(0);
  const lockState
    = userId === undefined
      ? { failedAttempts: 0, lockedUntil: null }
      : localAppLockStorage.getLockState(userId);
  const credential
    = userId === undefined ? null : localAppLockStorage.getCredential(userId);
  const credentialStatus
    = userId === undefined
      ? 'missing'
      : localAppLockStorage.getCredentialStatus(userId);
  const isLocked = isAppLockTemporarilyLocked(lockState, now);
  const isAppLockEntryRoute
    = location.pathname === '/settings/app-lock' || location.pathname === '/settings';
  const isAppLockManagementRoute = location.pathname === '/settings/app-lock';

  const resetRuntimeLock = useCallback(() => {
    lockVersionRef.current += 1;
    patternRef.current = [];
    isSubmittingRef.current = false;
    setPattern([]);
    setUnlocked(false);
    setError('');
    setIsSubmitting(false);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!isLocked)
      return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [isLocked]);

  useEffect(() => {
    if (!token || !config?.gestureLockEnabled)
      return undefined;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden')
        resetRuntimeLock();
    };
    const handlePageHide = () => resetRuntimeLock();
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted)
        resetRuntimeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [config?.gestureLockEnabled, resetRuntimeLock, token]);

  useEffect(() => {
    if (
      token
      && config?.gestureLockEnabled
      && !credential
      && !isAppLockEntryRoute
    ) {
      navigate('/settings/app-lock', { replace: true });
    }
  }, [
    config?.gestureLockEnabled,
    credential,
    isAppLockEntryRoute,
    location.pathname,
    navigate,
    token,
  ]);

  if (!token)
    return <>{children}</>;
  if (isLoading)
    return <PageLoadingState label={t('common.loading')} />;
  if (isError)
    return <PageLoadingState label={t('common.loadError')} />;
  if (!config || !config.gestureLockEnabled || unlocked)
    return <>{children}</>;
  // The settings page owns account-based recovery and must remain reachable
  // while the device lock is active. The page still requires the old pattern
  // for normal changes/disabling, or the account password for recovery.
  if (isAppLockManagementRoute)
    return <>{children}</>;
  if (!credential) {
    return (
      <PageLoadingState
        label={t(
          credentialStatus === 'corrupted'
            ? 'appLock.corruptedCredential'
            : 'appLock.missingCredential',
        )}
      />
    );
  }

  const handlePatternChange = (nextPattern: number[]) => {
    patternRef.current = nextPattern;
    setPattern(nextPattern);
  };

  const handleSubmitUnlock = async (submittedPattern: number[]) => {
    if (isLocked || isSubmittingRef.current || userId === undefined)
      return;
    if (isTooSimplePattern(submittedPattern)) {
      handlePatternChange([]);
      setError(t('appLock.tooSimple'));
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const submittedLockVersion = lockVersionRef.current;
    try {
      const valid = await verifyAppLockPattern(submittedPattern, credential);
      if (submittedLockVersion !== lockVersionRef.current)
        return;
      handlePatternChange([]);
      if (valid) {
        localAppLockStorage.removeLockState(userId);
        setUnlocked(true);
        setError('');
        return;
      }
      const nextState = recordAppLockFailure(lockState);
      localAppLockStorage.saveLockState(userId, nextState);
      setNow(Date.now());
      setError(nextState.lockedUntil ? t('appLock.locked') : t('appLock.wrong'));
    }
    catch {
      if (submittedLockVersion !== lockVersionRef.current)
        return;
      handlePatternChange([]);
      setError(t('common.loadError'));
    }
    finally {
      if (submittedLockVersion === lockVersionRef.current) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="page-new flex flex-col items-center justify-center gap-5 bg-primary-light/20 px-6">
      <div className="text-center">
        <h1 className="text-[22px] font-black text-ww-ink">
          {t('appLock.title')}
        </h1>
        <p className="mt-2 text-[13px] text-ww-mid">
          {isLocked ? t('appLock.locked') : t('appLock.unlock')}
        </p>
      </div>
      <PatternGesture
        disabled={isLocked || isSubmitting}
        onChange={handlePatternChange}
        onComplete={pattern => void handleSubmitUnlock(pattern)}
        pattern={pattern}
      />
      {error && (
        <p className="text-[12px] font-semibold text-red-500">{error}</p>
      )}
      <button
        className="text-[12px] font-bold text-primary-deep"
        disabled={isSubmitting}
        onClick={() => navigate('/settings/app-lock')}
        type="button"
      >
        {t('appLock.recovery')}
      </button>
      {isSubmitting && (
        <div aria-live="polite">
          <AppButton loading loadingLabel={t('appLock.verifying')}>
            {t('appLock.verifying')}
          </AppButton>
        </div>
      )}
    </div>
  );
};
