import { Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Link2,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useIssueShortcutAccessTokenMutation,
  useRevokeShortcutAccessTokenMutation,
  useShortcutAccessTokensQuery,
} from '@/entities/shortcut-bookkeeping';
import { useTranslation } from '@/shared/i18n';
import {
  AppButton,
  confirmAppAction,
  FormField,
  GradientPanel,
  PageHeader,
  PageLoadingState,
} from '@/shared/ui';
import {
  getConfiguredIosShortcutInstallUrl,
  openIosShortcutInstallUrl,
} from './model';

function getShortcutDraftEndpoint() {
  const configuredHost = typeof import.meta.env.VITE_HOST === 'string'
    ? import.meta.env.VITE_HOST.replace(/\/$/, '')
    : '';
  return `${configuredHost || window.location.origin}/api/shortcut-drafts`;
}

export default function ShortcutBookkeepingSettingsPage() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const tokenQuery = useShortcutAccessTokensQuery();
  const issueMutation = useIssueShortcutAccessTokenMutation();
  const revokeMutation = useRevokeShortcutAccessTokenMutation();
  const [deviceName, setDeviceName] = useState('');
  const [newToken, setNewToken] = useState<string>();
  const endpoint = useMemo(getShortcutDraftEndpoint, []);
  const installUrl = getConfiguredIosShortcutInstallUrl();

  const handleCopy = async (value: string) => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      }
    }
    catch {
      copied = false;
    }
    copied ||= copy(value);
    Toast.show({
      content: t(copied ? 'shortcutBookkeeping.copied' : 'shortcutBookkeeping.saveFailed'),
      icon: copied ? 'success' : 'fail',
    });
    return copied;
  };

  const handleCopyAndInstall = async (value: string) => {
    if (installUrl && await handleCopy(value))
      openIosShortcutInstallUrl(installUrl);
  };

  const handleCreateCredential = async () => {
    if (!deviceName.trim())
      return;
    try {
      const result = await issueMutation.mutateAsync({
        confirmationBaseUrl: window.location.origin,
        name: deviceName.trim(),
      });
      setNewToken(result.token);
      setDeviceName('');
      if (installUrl)
        await handleCopyAndInstall(result.token);
    }
    catch {
      Toast.show({ content: t('shortcutBookkeeping.saveFailed'), icon: 'fail' });
    }
  };

  const handleRevoke = async (tokenId: string) => {
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('shortcutBookkeeping.revoke'),
      description: t('shortcutBookkeeping.revokeDescription'),
      icon: <Trash2 size={22} strokeWidth={1.8} />,
      title: t('shortcutBookkeeping.revokeTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    try {
      await revokeMutation.mutateAsync(tokenId);
      Toast.show({ content: t('shortcutBookkeeping.revokeSuccess'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('shortcutBookkeeping.saveFailed'), icon: 'fail' });
    }
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate('/settings', { replace: true })}
        title={t('shortcutBookkeeping.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[560px] space-y-5">
          <GradientPanel className="flex items-start gap-3.5 px-4 py-4" elevation="low" surface="ice">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/80 bg-white/70 text-primary-deep shadow-ww-xs">
              <ShieldCheck size={22} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('shortcutBookkeeping.introTitle')}</h2>
              <p className="mt-1 text-[11px] leading-5 text-ww-mid">{t('shortcutBookkeeping.introDescription')}</p>
            </div>
          </GradientPanel>

          <section className="rounded-[20px] border border-border-primary bg-white/[0.88] p-4 shadow-ww backdrop-blur-xl">
            <div className="mb-4 flex items-start gap-3">
              <KeyRound className="mt-0.5 shrink-0 text-primary-deep" size={20} strokeWidth={1.8} />
              <div>
                <h2 className="text-[14px] font-extrabold text-ww-ink">{t('shortcutBookkeeping.credentialTitle')}</h2>
                <p className="mt-1 text-[11px] leading-4 text-ww-soft">{t('shortcutBookkeeping.credentialDescription')}</p>
              </div>
            </div>
            <FormField
              label={t('shortcutBookkeeping.deviceName')}
              maxLength={80}
              onChange={setDeviceName}
              onEnterPress={() => void handleCreateCredential()}
              placeholder={t('shortcutBookkeeping.deviceNamePlaceholder')}
              prefix={<Smartphone size={18} strokeWidth={1.8} />}
              value={deviceName}
            />
            <AppButton
              className="mt-3"
              disabled={!deviceName.trim()}
              fullWidth
              loading={issueMutation.isLoading}
              loadingLabel={t('shortcutBookkeeping.creatingCredential')}
              onClick={() => void handleCreateCredential()}
            >
              {t(installUrl
                ? 'shortcutBookkeeping.createAndInstall'
                : 'shortcutBookkeeping.createCredential')}
            </AppButton>
          </section>

          {newToken && (
            <section className="rounded-[20px] border border-primary/25 bg-primary-light/30 p-4 shadow-ww">
              <div className="flex items-center gap-2 text-primary-deep">
                <CheckCircle2 size={20} strokeWidth={1.9} />
                <h2 className="text-[14px] font-extrabold">{t('shortcutBookkeeping.newCredential')}</h2>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-ww-mid">{t('shortcutBookkeeping.newCredentialHint')}</p>
              <code className="mt-3 block break-all rounded-[14px] bg-white/80 px-3 py-3 text-[12px] leading-5 text-ww-ink shadow-ww-xs">{newToken}</code>
              <AppButton
                className="mt-3"
                fullWidth
                onClick={() => void (installUrl
                  ? handleCopyAndInstall(newToken)
                  : handleCopy(newToken))}
                variant="secondary"
              >
                <Copy size={17} />
                {t(installUrl
                  ? 'shortcutBookkeeping.copyAndInstall'
                  : 'shortcutBookkeeping.copyCredential')}
              </AppButton>
            </section>
          )}

          <section>
            <h2 className="mb-2 px-1 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">{t('shortcutBookkeeping.activeCredentials')}</h2>
            <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.88] shadow-ww">
              {tokenQuery.isLoading && <PageLoadingState compact label={t('common:nav.loading')} />}
              {tokenQuery.isError && (
                <div className="px-4 py-5 text-center">
                  <p className="text-[12px] text-ww-soft">{t('common:error.loadFail')}</p>
                  <button className="mt-2 border-0 bg-transparent text-[11px] font-extrabold text-primary-deep" onClick={() => void tokenQuery.refetch()} type="button">{t('common:retry')}</button>
                </div>
              )}
              {!tokenQuery.isLoading && !tokenQuery.isError && tokenQuery.data.length === 0 && (
                <p className="px-4 py-5 text-center text-[12px] text-ww-soft">{t('shortcutBookkeeping.noCredentials')}</p>
              )}
              {tokenQuery.data.map((token, index) => (
                <div className={`px-4 py-3.5 ${index > 0 ? 'border-t border-solid border-border-primary' : ''}`} key={token.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-extrabold text-ww-ink">{token.name}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-ww-soft">
                        {token.tokenPrefix}
                        ••••
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-ww-soft">
                        {token.lastUsedAt
                          ? t('shortcutBookkeeping.lastUsed', { time: dayjs(token.lastUsedAt).format('YYYY/MM/DD HH:mm') })
                          : t('shortcutBookkeeping.neverUsed')}
                        <br />
                        {t('shortcutBookkeeping.expires', { time: dayjs(token.expiresAt).format('YYYY/MM/DD') })}
                      </p>
                    </div>
                    <button className="shrink-0 border-0 bg-transparent px-2 py-1 text-[12px] font-bold text-[#b24f71]" onClick={() => void handleRevoke(token.id)} type="button">
                      {t('shortcutBookkeeping.revoke')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <details className="rounded-[20px] border border-border-primary bg-white/[0.88] p-4 shadow-ww" open={!installUrl}>
            <summary className="cursor-pointer list-none text-[13px] font-extrabold text-ww-ink">
              {t('shortcutBookkeeping.manualSetup')}
            </summary>
            <div className="mt-4 flex items-center gap-2.5 border-t border-solid border-border-primary pt-4">
              <Smartphone className="text-primary-deep" size={20} strokeWidth={1.8} />
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('shortcutBookkeeping.setupTitle')}</h2>
            </div>
            <ol className="mt-3 space-y-3">
              {[1, 2, 3, 4, 5].map(step => (
                <li className="flex gap-3 text-[11px] leading-5 text-ww-mid" key={step}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light font-extrabold text-primary-deep">{step}</span>
                  <span>{t(`shortcutBookkeeping.step${step}`)}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-[14px] bg-bg-primary px-3 py-3">
              <div className="flex items-start gap-2">
                <Link2 className="mt-0.5 shrink-0 text-primary-deep" size={17} />
                <code className="min-w-0 break-all text-[11px] leading-5 text-ww-ink">{endpoint}</code>
              </div>
              <button className="mt-2 border-0 bg-transparent p-0 text-[11px] font-extrabold text-primary-deep" onClick={() => void handleCopy(endpoint)} type="button">
                {t('shortcutBookkeeping.copyEndpoint')}
              </button>
            </div>
          </details>

          <GradientPanel className="px-4 py-4" elevation="low" surface="blush">
            <h2 className="text-[13px] font-extrabold text-ww-ink">{t('shortcutBookkeeping.backTapTitle')}</h2>
            <p className="mt-1 text-[11px] leading-5 text-ww-mid">{t('shortcutBookkeeping.backTapDescription')}</p>
            <p className="mt-3 border-t border-solid border-white/70 pt-3 text-[10px] leading-5 text-ww-soft">{t('shortcutBookkeeping.browserLoginHint')}</p>
          </GradientPanel>
        </div>
      </main>
    </div>
  );
}
