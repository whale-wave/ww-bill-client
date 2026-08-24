import type { FC, ReactNode } from 'react';
import type { UserAppConfig } from '@/entities/user-app-config';
import { useEffect, useState } from 'react';
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
import { PageLoadingState } from '@/shared/ui';

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
  const { t } = useTranslation('settings');
  const location = useLocation();
  const navigate = useNavigate();
  const userId = config?.user?.id;
  const [pattern, setPattern] = useState<number[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
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

  useEffect(() => {
    if (!isLocked)
      return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [isLocked]);

  useEffect(() => {
    if (
      token
      && config?.gestureLockEnabled
      && !credential
      && location.pathname !== '/settings/app-lock'
    ) {
      navigate('/settings/app-lock', { replace: true });
    }
  }, [
    config?.gestureLockEnabled,
    credential,
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
  if (!credential) {
    if (location.pathname === '/settings/app-lock')
      return <>{children}</>;
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

  const submit = async () => {
    if (isLocked || isTooSimplePattern(pattern) || userId === undefined)
      return;
    const valid = await verifyAppLockPattern(pattern, credential);
    setPattern([]);
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
        disabled={isLocked}
        onChange={setPattern}
        pattern={pattern}
      />
      {error && (
        <p className="text-[12px] font-semibold text-red-500">{error}</p>
      )}
      <button
        className="text-[12px] font-bold text-primary-deep"
        onClick={() => navigate('/settings/app-lock')}
        type="button"
      >
        {t('appLock.recovery')}
      </button>
      <button
        className="rounded-full bg-primary px-6 py-2 text-[13px] font-bold text-white disabled:opacity-50"
        disabled={isLocked || pattern.length < 4}
        onClick={() => void submit()}
        type="button"
      >
        {t('appLock.submit')}
      </button>
    </div>
  );
};
