import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  APP_LOCK_MIN_POINTS,
  createAppLockCredential,
  isTooSimplePattern,
  localAppLockStorage,
  PatternGesture,
  verifyAppLockPattern,
} from '@/entities/app-lock';
import { login } from '@/entities/auth';
import { useGetUserUserInfoQuery } from '@/entities/user';
import {
  useGetUserAppConfigQuery,
  usePatchUserAppConfigMutation,
} from '@/entities/user-app-config';
import { useTranslation } from '@/shared/i18n';
import { AppButton, FormField, GradientPanel, PageHeader } from '@/shared/ui';

type Phase = 'confirm' | 'draw' | 'idle' | 'recover' | 'verify';
type Action = 'change' | 'disable' | null;

function getErrorStatusCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('statusCode' in error))
    return undefined;
  const statusCode = error.statusCode;
  if (typeof statusCode === 'number')
    return statusCode;
  if (typeof statusCode === 'string')
    return Number(statusCode);
  return undefined;
}

function isInvalidRecoveryPassword(statusCode: number | undefined) {
  return statusCode === 400 || statusCode === 103;
}

function isSuccessStatusCode(statusCode: number | undefined) {
  return statusCode !== undefined && statusCode >= 200 && statusCode < 300;
}

const AppLockSettingsPage: FC = () => {
  const navigate = useNavigate();
  const { data: config, refetch: refetchConfig } = useGetUserAppConfigQuery();
  const { data: userInfo } = useGetUserUserInfoQuery();
  const [patchConfig, patchState] = usePatchUserAppConfigMutation();
  const { t } = useTranslation(['settings', 'common', 'user']);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [pattern, setPattern] = useState<number[]>([]);
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;
    const previousBodyTouchAction = body.style.touchAction;
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';
    body.style.touchAction = 'none';
    return () => {
      html.style.overscrollBehavior = previousHtmlOverscrollBehavior;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;
      body.style.touchAction = previousBodyTouchAction;
    };
  }, []);
  const userId = config?.userId;
  const credential
    = userId === undefined ? null : localAppLockStorage.getCredential(userId);
  const isEnabled = Boolean(config?.gestureLockEnabled && credential);
  const credentialStatus
    = userId === undefined
      ? 'missing'
      : localAppLockStorage.getCredentialStatus(userId);

  const currentPhase = phase
    ?? (isEnabled
      ? 'idle'
      : config?.gestureLockEnabled && credentialStatus === 'corrupted'
        ? 'recover'
        : 'draw');

  const handlePatternChange = (nextPattern: number[]) => {
    setPattern(nextPattern);
  };

  const reset = (nextPhase: Phase = isEnabled ? 'idle' : 'draw') => {
    setPhase(nextPhase);
    setAction(null);
    handlePatternChange([]);
    setFirstPattern([]);
    setPassword('');
    setError('');
  };

  const handleBack = () => navigate('/settings', { replace: true });

  const handleDisable = async () => {
    try {
      await patchConfig({ gestureLockEnabled: false });
      if (userId !== undefined) {
        localAppLockStorage.removeCredential(userId);
        localAppLockStorage.removeLockState(userId);
      }
      Toast.show(t('appLock.disabled'));
      handleBack();
    }
    catch {
      const refreshed = await refetchConfig();
      if (refreshed.data?.data?.gestureLockEnabled)
        return;
      setError(t('common:error.loadFail'));
    }
  };

  const handleSubmitPattern = async (submittedPattern: number[]) => {
    if (userId === undefined) {
      setError(t('common:error.loadFail'));
      handlePatternChange([]);
      return;
    }
    if (submittedPattern.length < APP_LOCK_MIN_POINTS) {
      setError(t('appLock.tooSimple'));
      handlePatternChange([]);
      return;
    }
    if (currentPhase === 'verify') {
      if (isSubmittingRef.current)
        return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      try {
        if (!credential || !(await verifyAppLockPattern(submittedPattern, credential))) {
          setError(t('appLock.wrong'));
          handlePatternChange([]);
          return;
        }
        if (action === 'disable') {
          await handleDisable();
          return;
        }
        reset('draw');
      }
      catch {
        setError(t('common:error.loadFail'));
        handlePatternChange([]);
      }
      finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
      return;
    }
    if (isTooSimplePattern(submittedPattern)) {
      setError(t('appLock.tooSimple'));
      handlePatternChange([]);
      return;
    }
    if (currentPhase === 'draw') {
      setFirstPattern(submittedPattern);
      handlePatternChange([]);
      setPhase('confirm');
      setError('');
      return;
    }
    if (submittedPattern.join('-') !== firstPattern.join('-')) {
      setError(t('appLock.mismatch'));
      handlePatternChange([]);
      return;
    }
    if (isSubmittingRef.current)
      return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    let didAttemptPatch = false;
    try {
      const nextCredential = await createAppLockCredential(submittedPattern);
      localAppLockStorage.saveCredential(userId, nextCredential);
      didAttemptPatch = true;
      await patchConfig({ gestureLockEnabled: true });
      Toast.show(t('appLock.enabled'));
      handleBack();
    }
    catch {
      if (!didAttemptPatch) {
        try {
          localAppLockStorage.removeCredential(userId);
        }
        catch {
          // The visible error below still allows the user to retry.
        }
        setError(t('common:error.loadFail'));
        handlePatternChange([]);
        return;
      }
      try {
        const refreshed = await refetchConfig();
        if (refreshed.data?.data?.gestureLockEnabled) {
          Toast.show(t('appLock.enabled'));
          handleBack();
          return;
        }
      }
      catch {
        setError(t('common:error.loadFail'));
        handlePatternChange([]);
        return;
      }
      try {
        localAppLockStorage.removeCredential(userId);
      }
      catch {
        // The visible error below still allows the user to retry.
      }
      setError(t('common:error.loadFail'));
      handlePatternChange([]);
    }
    finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRecover = async () => {
    if (!password || !userInfo?.username || userId === undefined || isSubmittingRef.current)
      return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      let loginResponse;
      try {
        loginResponse = await login({ username: userInfo.username, password }, false);
      }
      catch (error) {
        setError(isInvalidRecoveryPassword(getErrorStatusCode(error))
          ? t('appLock.passwordIncorrect')
          : t('appLock.recoveryFailed'));
        return;
      }
      if (!isSuccessStatusCode(loginResponse.statusCode)) {
        setError(isInvalidRecoveryPassword(loginResponse.statusCode)
          ? t('appLock.passwordIncorrect')
          : t('appLock.recoveryFailed'));
        return;
      }

      let patchResponse;
      try {
        patchResponse = await patchConfig({ gestureLockEnabled: false });
      }
      catch {
        setError(t('appLock.recoveryFailed'));
        return;
      }
      if (!isSuccessStatusCode(patchResponse?.statusCode)) {
        setError(t('appLock.recoveryFailed'));
        return;
      }

      localAppLockStorage.removeCredential(userId);
      localAppLockStorage.removeLockState(userId);
      Toast.show(t('appLock.disabled'));
      handleBack();
    }
    finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (currentPhase === 'idle') {
    return (
      <div className="page-new relative touch-none overflow-hidden overscroll-none">
        <PageHeader
          backLabel={t('common:nav.back')}
          onBack={handleBack}
          title={t('appLock.title')}
        />
        <main className="relative z-[1] min-h-0 flex-grow overflow-hidden overscroll-none px-[18px] pb-8">
          <div className="mx-auto w-full max-w-[520px]">
            <GradientPanel
              className="mb-5 px-5 py-5"
              elevation="low"
              surface="ice"
            >
              <h2 className="text-[18px] font-black text-ww-ink">
                {t('appLock.enabled')}
              </h2>
              <p className="mt-2 text-[12px] leading-5 text-ww-mid">
                {t('appLock.description')}
              </p>
            </GradientPanel>
            <div className="flex flex-col gap-3">
              <button
                className="h-12 rounded-[16px] bg-primary font-bold text-white"
                onClick={() => {
                  setAction('change');
                  setPhase('verify');
                }}
                type="button"
              >
                {t('appLock.change')}
              </button>
              <button
                className="h-12 rounded-[16px] border border-red-200 bg-white font-bold text-red-500"
                onClick={() => {
                  setAction('disable');
                  setPhase('verify');
                }}
                type="button"
              >
                {t('appLock.disable')}
              </button>
              <button
                className="h-10 text-[12px] font-bold text-primary-deep"
                onClick={() => setPhase('recover')}
                type="button"
              >
                {t('appLock.recovery')}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentPhase === 'recover') {
    return (
      <div className="page-new relative touch-none overflow-hidden overscroll-none">
        <PageHeader
          backLabel={t('common:nav.back')}
          onBack={handleBack}
          title={t('appLock.recovery')}
        />
        <main className="relative z-[1] min-h-0 flex-grow overflow-hidden overscroll-none px-[18px] pb-8">
          <div className="mx-auto w-full max-w-[420px]">
            <GradientPanel
              className="space-y-4 px-5 py-5"
              elevation="high"
              surface="glass"
            >
              <p className="text-[13px] leading-5 text-ww-mid">
                {t('appLock.recoveryDescription')}
              </p>
              <FormField
                autoComplete="current-password"
                label={t('user:password.oldPassword')}
                onChange={setPassword}
                type="password"
                value={password}
              />
              {error && (
                <p className="text-[12px] font-semibold text-red-500">
                  {error}
                </p>
              )}
              <button
                className="h-12 w-full rounded-[16px] bg-primary font-bold text-white disabled:opacity-50"
                disabled={!password || isSubmitting}
                onClick={() => void handleRecover()}
                type="button"
              >
                {isSubmitting ? t('appLock.verifying') : t('appLock.submit')}
              </button>
            </GradientPanel>
          </div>
        </main>
      </div>
    );
  }

  const title
    = currentPhase === 'verify'
      ? t('appLock.unlock')
      : currentPhase === 'confirm'
        ? t('appLock.confirm')
        : t('appLock.setupTitle');
  return (
    <div className="page-new relative touch-none overflow-hidden overscroll-none">
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={handleBack}
        title={t('appLock.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-hidden overscroll-none px-[18px] pb-8">
        <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-5">
          <GradientPanel
            className="w-full px-5 py-5"
            elevation="low"
            surface="ice"
          >
            <h2 className="text-[18px] font-black text-ww-ink">{title}</h2>
            <p className="mt-2 text-[12px] leading-5 text-ww-mid">
              {t('appLock.setupDescription')}
            </p>
          </GradientPanel>
          <PatternGesture
            disabled={isSubmitting}
            onChange={handlePatternChange}
            onComplete={pattern => void handleSubmitPattern(pattern)}
            pattern={pattern}
          />
          {error && (
            <p className="text-center text-[12px] font-semibold text-red-500">
              {error}
            </p>
          )}
          <div className="flex w-full max-w-[360px] gap-3" aria-live="polite">
            <AppButton
              className="flex-1"
              disabled={patchState.isLoading || isSubmitting}
              onClick={() => reset()}
              variant="secondary"
            >
              {t('appLock.reset')}
            </AppButton>
            {isSubmitting && (
              <AppButton
                className="flex-1"
                loading
                loadingLabel={t('appLock.processing')}
              >
                {t('appLock.processing')}
              </AppButton>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLockSettingsPage;
