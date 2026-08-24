import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { useState } from 'react';
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
import { FormField, GradientPanel, PageHeader } from '@/shared/ui';

type Phase = 'confirm' | 'draw' | 'idle' | 'recover' | 'verify';
type Action = 'change' | 'disable' | null;

const AppLockSettingsPage: FC = () => {
  const navigate = useNavigate();
  const { data: config, refetch: refetchConfig } = useGetUserAppConfigQuery();
  const { data: userInfo } = useGetUserUserInfoQuery();
  const [patchConfig, patchState] = usePatchUserAppConfigMutation();
  const { t } = useTranslation('settings');
  const [phase, setPhase] = useState<Phase>('draw');
  const [action, setAction] = useState<Action>(null);
  const [pattern, setPattern] = useState<number[]>([]);
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const userId = config?.user?.id;
  const credential
    = userId === undefined ? null : localAppLockStorage.getCredential(userId);
  const isEnabled = Boolean(config?.gestureLockEnabled && credential);
  const credentialStatus
    = userId === undefined
      ? 'missing'
      : localAppLockStorage.getCredentialStatus(userId);

  const currentPhase = isEnabled
    ? 'idle'
    : config?.gestureLockEnabled && credentialStatus === 'corrupted'
      ? 'recover'
      : phase;

  const reset = (nextPhase: Phase = isEnabled ? 'idle' : 'draw') => {
    setPhase(nextPhase);
    setAction(null);
    setPattern([]);
    setFirstPattern([]);
    setPassword('');
    setError('');
  };

  const handleDisable = async () => {
    try {
      await patchConfig({ gestureLockEnabled: false });
      if (userId !== undefined) {
        localAppLockStorage.removeCredential(userId);
        localAppLockStorage.removeLockState(userId);
      }
      Toast.show(t('appLock.disabled'));
      navigate(-1);
    }
    catch {
      const refreshed = await refetchConfig();
      if (refreshed.data?.data?.gestureLockEnabled)
        return;
      setError(t('common.loadError'));
    }
  };

  const handleSubmitPattern = async () => {
    if (pattern.length < APP_LOCK_MIN_POINTS || userId === undefined)
      return;
    if (currentPhase === 'verify') {
      if (!credential || !(await verifyAppLockPattern(pattern, credential))) {
        setError(t('appLock.wrong'));
        setPattern([]);
        return;
      }
      if (action === 'disable') {
        await handleDisable();
        return;
      }
      reset('draw');
      return;
    }
    if (isTooSimplePattern(pattern)) {
      setError(t('appLock.tooSimple'));
      return;
    }
    if (currentPhase === 'draw') {
      setFirstPattern(pattern);
      setPattern([]);
      setPhase('confirm');
      setError('');
      return;
    }
    if (pattern.join('-') !== firstPattern.join('-')) {
      setError(t('appLock.mismatch'));
      setPattern([]);
      return;
    }
    const nextCredential = await createAppLockCredential(pattern);
    localAppLockStorage.saveCredential(userId, nextCredential);
    try {
      await patchConfig({ gestureLockEnabled: true });
      Toast.show(t('appLock.enabled'));
      navigate(-1);
    }
    catch {
      const refreshed = await refetchConfig();
      if (refreshed.data?.data?.gestureLockEnabled)
        return;
      localAppLockStorage.removeCredential(userId);
      setError(t('common.loadError'));
    }
  };

  const handleRecover = async () => {
    if (!password || !userInfo?.username || userId === undefined)
      return;
    try {
      await login({ username: userInfo.username, password }, false);
      await patchConfig({ gestureLockEnabled: false });
      localAppLockStorage.removeCredential(userId);
      localAppLockStorage.removeLockState(userId);
      Toast.show(t('appLock.disabled'));
      navigate(-1);
    }
    catch {
      setError(t('appLock.wrong'));
    }
  };

  if (currentPhase === 'idle') {
    return (
      <div className="page-new relative overflow-hidden">
        <PageHeader
          backLabel={t('common.nav.back')}
          onBack={() => navigate(-1)}
          title={t('appLock.title')}
        />
        <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-8">
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
      <div className="page-new relative overflow-hidden">
        <PageHeader
          backLabel={t('common.nav.back')}
          onBack={() => reset()}
          title={t('appLock.recovery')}
        />
        <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-8">
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
                label={t('password.oldPassword')}
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
                disabled={!password}
                onClick={() => void handleRecover()}
                type="button"
              >
                {t('appLock.submit')}
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
    <div className="page-new relative overflow-hidden">
      <PageHeader
        backLabel={t('common.nav.back')}
        onBack={() => reset()}
        title={t('appLock.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-8">
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
          <PatternGesture pattern={pattern} onChange={setPattern} />
          {error && (
            <p className="text-center text-[12px] font-semibold text-red-500">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              className="rounded-full border border-border-primary px-5 py-2 text-[13px] font-bold text-ww-mid"
              onClick={() => reset()}
              type="button"
            >
              {t('appLock.reset')}
            </button>
            <button
              className="rounded-full bg-primary px-5 py-2 text-[13px] font-bold text-white disabled:opacity-50"
              disabled={
                patchState.isLoading || pattern.length < APP_LOCK_MIN_POINTS
              }
              onClick={() => void handleSubmitPattern()}
              type="button"
            >
              {t('appLock.submit')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLockSettingsPage;
