import type { ShortcutAccessTokenSummary } from '@/entities/shortcut-bookkeeping';
import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import {
  BookOpen,
  Camera,
  CheckCircle2,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import step01 from '@/assets/shortcut-bookkeeping/01-get-shortcut.png';
import step02 from '@/assets/shortcut-bookkeeping/02-share-shortcut.png';
import step03 from '@/assets/shortcut-bookkeeping/03-token-empty.png';
import step04 from '@/assets/shortcut-bookkeeping/04-token-filled.png';
import step05 from '@/assets/shortcut-bookkeeping/05-add-shortcut.jpg';
import step06 from '@/assets/shortcut-bookkeeping/06-settings.png';
import step07 from '@/assets/shortcut-bookkeeping/07-settings-accessibility.png';
import step08 from '@/assets/shortcut-bookkeeping/08-accessibility-touch.png';
import step09 from '@/assets/shortcut-bookkeeping/09-touch-backtap.png';
import step10 from '@/assets/shortcut-bookkeeping/10-backtap.png';
import step11 from '@/assets/shortcut-bookkeeping/11-select-shortcut.png';
import {
  useIssueShortcutAccessTokenMutation,
  useRevokeShortcutAccessTokenMutation,
  useShortcutAccessTokensQuery,
  useShortcutInstallUrlQuery,
} from '@/entities/shortcut-bookkeeping';
import { isRequestError } from '@/shared/api';
import { useTranslation } from '@/shared/i18n';
import {
  AppButton,
  confirmAppAction,
  PageHeader,
  PageLoadingState,
  Surface,
} from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
import shortcutInstallGuide from '../../../public/shortcut-install-guide.png';
import {
  getConfiguredIosShortcutInstallUrl,
  getShortcutTokenRetryAt,
  openIosShortcutInstallUrl,
} from './model';

type ShortcutView
  = | 'loading'
    | 'intro'
    | 'create-key'
    | 'key-created'
    | 'install-guide'
    | 'overview'
    | 'usage-guide'
    | 'faq'
    | 'connections';
const INSTALL_COUNTDOWN_SECONDS = 5;

const usageSections = [
  { key: 'find', icon: Camera, images: [step01, step02] },
  { key: 'configure', icon: KeyRound, images: [step03, step04, step05] },
  {
    key: 'backTap',
    icon: Smartphone,
    images: [step06, step07, step08, step09, step10, step11],
  },
] as const;

function maskToken(token: string, visible: boolean) {
  if (visible || token.length < 12)
    return token;
  return `${token.slice(0, 6)}${'•'.repeat(Math.min(12, token.length - 10))}${token.slice(-4)}`;
}

function statusText(
  token: ShortcutAccessTokenSummary,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  return token.lastUsedAt
    ? t('shortcutBookkeeping.connections.lastUsed', {
        time: dayjs(token.lastUsedAt).format('YYYY/MM/DD HH:mm'),
      })
    : undefined;
}

export default function ShortcutBookkeepingSettingsPage() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const tokenQuery = useShortcutAccessTokensQuery();
  const shortcutInstallQuery = useShortcutInstallUrlQuery();
  const issueMutation = useIssueShortcutAccessTokenMutation();
  const revokeMutation = useRevokeShortcutAccessTokenMutation();
  const installUrl
    = shortcutInstallQuery.data ?? getConfiguredIosShortcutInstallUrl();
  const [view, setView] = useState<ShortcutView>('loading');
  const [newToken, setNewToken] = useState<string>();
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<Date>();
  const [countdown, setCountdown] = useState(INSTALL_COUNTDOWN_SECONDS);
  const deadlineRef = useRef<number>();
  const redirectedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const hasSetupFlow
    = Boolean(newToken)
      || view === 'create-key'
      || view === 'key-created'
      || view === 'install-guide';

  useEffect(() => {
    if (!rateLimitedUntil)
      return;
    const timeoutId = window.setTimeout(
      setRateLimitedUntil,
      Math.max(0, rateLimitedUntil.getTime() - Date.now()),
      undefined,
    );
    return () => window.clearTimeout(timeoutId);
  }, [rateLimitedUntil]);

  useEffect(() => {
    if (
      tokenQuery.isLoading
      || tokenQuery.isError
      || shortcutInstallQuery.isLoading
      || hasSetupFlow
    ) {
      return;
    }
    setView(tokenQuery.data.length ? 'overview' : 'intro');
  }, [
    hasSetupFlow,
    shortcutInstallQuery.isLoading,
    tokenQuery.data,
    tokenQuery.isError,
    tokenQuery.isLoading,
  ]);

  const clearTimer = () => {
    if (timerRef.current)
      clearInterval(timerRef.current);
    timerRef.current = undefined;
  };

  const redirectToInstaller = () => {
    if (!installUrl || redirectedRef.current)
      return;
    redirectedRef.current = true;
    clearTimer();
    openIosShortcutInstallUrl(installUrl);
  };

  useEffect(() => {
    if (view !== 'install-guide' || !installUrl) {
      clearTimer();
      return;
    }
    redirectedRef.current = false;
    deadlineRef.current = Date.now() + INSTALL_COUNTDOWN_SECONDS * 1000;
    setCountdown(INSTALL_COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((deadlineRef.current! - Date.now()) / 1000),
      );
      setCountdown(left);
      if (left === 0)
        redirectToInstaller();
    }, 200);
    return clearTimer;
  }, [installUrl, view]);
  useEffect(() => clearTimer, []);

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
    if (!copied)
      showAppError(undefined, { message: t('shortcutBookkeeping.copyFailed') });
    return copied;
  };

  const handleCreate = async () => {
    if (!installUrl)
      return;
    try {
      const result = await issueMutation.mutateAsync({
        confirmationBaseUrl: window.location.origin,
        name: t('shortcutBookkeeping.defaultName'),
      });
      setNewToken(result.token);
      setRateLimitedUntil(undefined);
      setIsTokenVisible(false);
      setView('key-created');
    }
    catch (error) {
      const isRateLimited = isRequestError(error) && error.statusCode === 429;
      const retryAt = isRateLimited && error.code === 'SHORTCUT_TOKEN_ISSUE_RATE_LIMITED'
        ? getShortcutTokenRetryAt(error.data)
        : undefined;
      if (isRateLimited)
        setRateLimitedUntil(retryAt);
      showAppError(error, {
        fallbackMessage: t('shortcutBookkeeping.saveFailed'),
        message: isRateLimited
          ? retryAt
            ? t('shortcutBookkeeping.createRateLimitedUntil', {
                time: dayjs(retryAt).format('YYYY/MM/DD HH:mm:ss'),
              })
            : t('shortcutBookkeeping.createRateLimited')
          : undefined,
      });
    }
  };

  const handleCopyAndContinue = async () => {
    if (!newToken || !installUrl || !(await handleCopy(newToken)))
      return;
    setView('install-guide');
  };

  const handleBack = async () => {
    if (view === 'intro' || view === 'overview' || view === 'loading') {
      navigate('/settings', { replace: true });
      return;
    }
    if (view === 'create-key') {
      setView('intro');
      return;
    }
    if (view === 'key-created' && newToken) {
      const confirmed = await confirmAppAction({
        cancelText: t('common:nav.cancel'),
        confirmText: t('shortcutBookkeeping.leaveConfirm'),
        description: t('shortcutBookkeeping.leaveDescription'),
        icon: <KeyRound size={22} />,
        title: t('shortcutBookkeeping.leaveTitle'),
        tone: 'danger',
      });
      if (!confirmed)
        return;
      setNewToken(undefined);
      setView('overview');
      return;
    }
    clearTimer();
    setNewToken(undefined);
    setView('overview');
  };

  const handleRevoke = async (tokenId: string) => {
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('shortcutBookkeeping.connections.revoke'),
      description: t('shortcutBookkeeping.connections.revokeDescription'),
      icon: <Trash2 size={22} />,
      title: t('shortcutBookkeeping.connections.revokeTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    try {
      await revokeMutation.mutateAsync(tokenId);
      if (tokenQuery.data.length <= 1) {
        setNewToken(undefined);
        setView('intro');
      }
    }
    catch {
      showAppError({
        content: t('shortcutBookkeeping.saveFailed'),
        icon: 'fail',
      });
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      <Surface className="px-4 py-5 text-center" material="raised">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary-deep">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mt-3 text-[20px] font-extrabold text-ww-ink">
          {t('shortcutBookkeeping.overview.connectedTitle')}
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-ww-mid">
          {t('shortcutBookkeeping.overview.connectedDescription')}
        </p>
      </Surface>
      <div className="space-y-3">
        <button
          className="flex min-h-16 w-full items-center gap-3 rounded-[18px] border border-border-primary bg-white/[0.88] px-4 text-left shadow-ww"
          onClick={() => setView('usage-guide')}
          type="button"
        >
          <BookOpen className="text-primary-deep" size={24} />
          <span className="min-w-0 flex-1">
            <strong className="block text-[14px] text-ww-ink">
              {t('shortcutBookkeeping.overview.usage')}
            </strong>
            <small className="mt-0.5 block text-[11px] text-ww-soft">
              {t('shortcutBookkeeping.overview.usageDescription')}
            </small>
          </span>
          <span className="text-ww-soft">›</span>
        </button>
        <button
          className="flex min-h-16 w-full items-center gap-3 rounded-[18px] border border-border-primary bg-white/[0.88] px-4 text-left shadow-ww"
          onClick={() => setView('connections')}
          type="button"
        >
          <KeyRound className="text-primary-deep" size={24} />
          <span className="min-w-0 flex-1">
            <strong className="block text-[14px] text-ww-ink">
              {t('shortcutBookkeeping.overview.connections')}
            </strong>
            <small className="mt-0.5 block text-[11px] text-ww-soft">
              {t('shortcutBookkeeping.overview.connectionsDescription')}
            </small>
          </span>
          <span className="text-ww-soft">›</span>
        </button>
        <button
          className="flex min-h-16 w-full items-center gap-3 rounded-[18px] border border-border-primary bg-white/[0.88] px-4 text-left shadow-ww"
          onClick={() => setView('faq')}
          type="button"
        >
          <CircleHelp className="text-primary-deep" size={24} />
          <span className="min-w-0 flex-1">
            <strong className="block text-[14px] text-ww-ink">
              {t('shortcutBookkeeping.overview.faq')}
            </strong>
            <small className="mt-0.5 block text-[11px] text-ww-soft">
              {t('shortcutBookkeeping.overview.faqDescription')}
            </small>
          </span>
          <span className="text-ww-soft">›</span>
        </button>
      </div>
    </div>
  );

  const renderConnections = () => (
    <div className="space-y-4">
      <Surface className="overflow-hidden" material="content">
        {tokenQuery.data.map((token, index) => (
          <div
            className={`px-4 py-4 ${index > 0 ? 'border-t border-solid border-border-primary' : ''}`}
            key={token.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-extrabold text-ww-ink">
                  {token.name}
                </p>
                <p className="mt-1 font-mono text-[11px] text-ww-soft">
                  {token.tokenPrefix}
                  ••••••
                </p>
                <p className="mt-2 text-[11px] leading-5 text-ww-mid">
                  {token.lastUsedAt && (
                    <>
                      {statusText(token, t)}
                      <br />
                    </>
                  )}
                  {t('shortcutBookkeeping.connections.expires', {
                    time: dayjs(token.expiresAt).format('YYYY/MM/DD'),
                  })}
                </p>
              </div>
              <button
                className="min-h-11 shrink-0 border-0 bg-transparent px-2 text-[12px] font-extrabold text-feedback-danger"
                onClick={() => void handleRevoke(token.id)}
                type="button"
              >
                {t('shortcutBookkeeping.connections.revoke')}
              </button>
            </div>
          </div>
        ))}
      </Surface>
      <Surface className="px-4 py-4" material="content">
        <div className="flex gap-2 text-[11px] leading-5 text-ww-mid">
          <Info className="mt-0.5 shrink-0 text-primary-deep" size={17} />
          <span>{t('shortcutBookkeeping.connections.securityHint')}</span>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-ww-soft">
          {t('shortcutBookkeeping.connections.recoveryHint')}
        </p>
      </Surface>
    </div>
  );

  const renderFaq = () => (
    <div className="space-y-4">
      <Surface className="px-4 py-5" material="raised">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-deep">
            <CircleHelp size={22} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold tracking-[1px] text-primary-deep">
              {t('shortcutBookkeeping.faq.eyebrow')}
            </p>
            <h2 className="mt-1 text-[20px] font-extrabold text-ww-ink">
              {t('shortcutBookkeeping.faq.title')}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-ww-mid">
              {t('shortcutBookkeeping.faq.description')}
            </p>
          </div>
        </div>
      </Surface>
      <Surface className="overflow-hidden" material="content">
        {(['recognition', 'feedback', 'improve'] as const).map((key, index) => (
          <article
            className={`px-4 py-4 ${index > 0 ? 'border-t border-solid border-border-primary' : ''}`}
            key={key}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-[12px] font-extrabold text-primary-deep">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[14px] font-extrabold text-ww-ink">
                  {t(`shortcutBookkeeping.faq.items.${key}.question`)}
                </h3>
                <p className="mt-1 text-[12px] leading-5 text-ww-mid">
                  {t(`shortcutBookkeeping.faq.items.${key}.answer`)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </Surface>
      <AppButton fullWidth onClick={() => navigate('/feedback')} size="large">
        {t('shortcutBookkeeping.faq.feedbackAction')}
      </AppButton>
    </div>
  );

  const renderContent = () => {
    if (
      tokenQuery.isLoading
      || shortcutInstallQuery.isLoading
      || view === 'loading'
    ) {
      return <PageLoadingState compact label={t('common:nav.loading')} />;
    }
    if (tokenQuery.isError) {
      return (
        <div className="rounded-[20px] bg-white/80 px-4 py-8 text-center">
          <p className="text-[12px] text-ww-soft">
            {t('common:error.loadFail')}
          </p>
          <button
            className="mt-2 border-0 bg-transparent text-[11px] font-extrabold text-primary-deep"
            onClick={() => void tokenQuery.refetch()}
            type="button"
          >
            {t('common:retry')}
          </button>
        </div>
      );
    }
    if (view === 'intro') {
      return (
        <Surface className="px-5 py-6 text-center" material="raised">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary-light text-primary-deep">
            <Smartphone size={34} />
          </div>
          <h2 className="mt-4 text-[24px] font-extrabold text-ww-ink">
            {t('shortcutBookkeeping.intro.title')}
          </h2>
          <p className="mt-2 text-[18px] font-extrabold text-ww-ink">
            {t('shortcutBookkeeping.intro.headline')}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-ww-mid">
            {t('shortcutBookkeeping.intro.description')}
          </p>
          <div className="mt-6 space-y-3 text-left">
            {[
              [Camera, 'fast'],
              [Smartphone, 'anywhere'],
              [ShieldCheck, 'safe'],
            ].map(([Icon, key]) => (
              <div className="flex items-center gap-3" key={key as string}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                  <Icon size={20} />
                </span>
                <span>
                  <strong className="block text-[13px] text-ww-ink">
                    {t(`shortcutBookkeeping.intro.${key}.title`)}
                  </strong>
                  <small className="text-[11px] text-ww-mid">
                    {t(`shortcutBookkeeping.intro.${key}.description`)}
                  </small>
                </span>
              </div>
            ))}
          </div>
          {!installUrl && (
            <div className="mt-5 rounded-[14px] bg-amber-50 px-3 py-3 text-left text-[11px] leading-5 text-amber-700">
              {t('shortcutBookkeeping.unavailable')}
            </div>
          )}
          <AppButton
            className="mt-6"
            disabled={!installUrl}
            fullWidth
            loading={issueMutation.isLoading}
            loadingLabel={t('shortcutBookkeeping.createKey.creating')}
            onClick={() => setView('create-key')}
            size="large"
          >
            {t('shortcutBookkeeping.intro.start')}
          </AppButton>
        </Surface>
      );
    }
    if (view === 'create-key') {
      return (
        <Surface className="px-5 py-6" material="raised">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-[18px] font-extrabold text-white">
              1
            </span>
            <div>
              <h2 className="text-[20px] font-extrabold text-ww-ink">
                {t('shortcutBookkeeping.createKey.title')}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-ww-mid">
                {t('shortcutBookkeeping.createKey.description')}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-[16px] bg-primary-light/60 px-4 py-4 text-[12px] leading-5 text-ww-mid">
            <ShieldCheck className="mb-2 text-primary-deep" size={22} />
            {t('shortcutBookkeeping.createKey.security')}
          </div>
          {rateLimitedUntil && (
            <p className="mt-4 rounded-[14px] bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-700" role="alert">
              {t('shortcutBookkeeping.createRateLimitedUntil', {
                time: dayjs(rateLimitedUntil).format('YYYY/MM/DD HH:mm:ss'),
              })}
            </p>
          )}
          <AppButton
            className="mt-8"
            fullWidth
            loading={issueMutation.isLoading}
            loadingLabel={t('shortcutBookkeeping.createKey.creating')}
            onClick={() => void handleCreate()}
            size="large"
          >
            {t('shortcutBookkeeping.createKey.submit')}
          </AppButton>
        </Surface>
      );
    }
    if (view === 'key-created' && newToken) {
      return (
        <Surface className="px-5 py-6" material="raised">
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-primary-deep" size={48} />
            <h2 className="mt-3 text-[20px] font-extrabold text-ww-ink">
              {t('shortcutBookkeeping.keyCreated.title')}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-ww-mid">
              {t('shortcutBookkeeping.keyCreated.description')}
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-[14px] bg-bg-primary px-3 py-3 font-mono text-[12px] text-ww-ink">
            <code className="min-w-0 flex-1 break-all">
              {maskToken(newToken, isTokenVisible)}
            </code>
            <button
              aria-label={t(
                isTokenVisible
                  ? 'shortcutBookkeeping.keyCreated.hide'
                  : 'shortcutBookkeeping.keyCreated.show',
              )}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-white text-primary-deep"
              onClick={() => setIsTokenVisible(value => !value)}
              type="button"
            >
              {isTokenVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              aria-label={t('shortcutBookkeeping.keyCreated.copy')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-white text-primary-deep"
              onClick={() => void handleCopy(newToken)}
              type="button"
            >
              <Copy size={18} />
            </button>
          </div>
          <div className="mt-4 rounded-[14px] bg-amber-50 px-3 py-3 text-[11px] leading-5 text-amber-700">
            {t('shortcutBookkeeping.keyCreated.warning')}
          </div>
          <AppButton
            className="mt-4"
            fullWidth
            onClick={() => void handleCopyAndContinue()}
            size="large"
          >
            <Copy size={17} />
            {t('shortcutBookkeeping.keyCreated.continue')}
          </AppButton>
        </Surface>
      );
    }
    if (view === 'install-guide') {
      return (
        <Surface className="px-4 py-5" material="raised">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-[18px] font-extrabold text-white">
              2
            </span>
            <div>
              <h2 className="text-[20px] font-extrabold text-ww-ink">
                {t('shortcutBookkeeping.installGuide.title')}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-ww-mid">
                {t('shortcutBookkeeping.installGuide.description')}
              </p>
            </div>
          </div>
          <img
            alt={t('shortcutBookkeeping.installGuide.imageAlt')}
            className="mt-5 w-full rounded-[16px]"
            src={shortcutInstallGuide}
          />
          <ol className="mt-5 space-y-3">
            {['paste', 'confirm', 'run'].map((key, index) => (
              <li
                className="flex gap-3 text-[12px] leading-5 text-ww-mid"
                key={key}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light font-extrabold text-primary-deep">
                  {index + 1}
                </span>
                {t(`shortcutBookkeeping.installGuide.steps.${key}`)}
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-[14px] bg-primary-light/60 px-3 py-3 text-center text-[13px] font-extrabold text-primary-deep">
            {countdown > 0
              ? t('shortcutBookkeeping.installGuide.countdown', {
                  seconds: countdown,
                })
              : t('shortcutBookkeeping.installGuide.opening')}
          </div>
          <button
            className="mt-3 min-h-11 w-full border-0 bg-transparent text-[12px] font-extrabold text-primary-deep"
            onClick={redirectToInstaller}
            type="button"
          >
            {t('shortcutBookkeeping.installGuide.openNow')}
          </button>
        </Surface>
      );
    }
    if (view === 'usage-guide') {
      return (
        <div className="space-y-5">
          <Surface className="px-4 py-5" material="raised">
            <p className="text-[11px] font-extrabold tracking-[1px] text-primary-deep">
              {t('shortcutBookkeeping.usage.eyebrow')}
            </p>
            <h2 className="mt-1 text-[22px] font-extrabold text-ww-ink">
              {t('shortcutBookkeeping.usage.title')}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-ww-mid">
              {t('shortcutBookkeeping.usage.description')}
            </p>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {usageSections.map((section, index) => (
                <span
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-[11px] font-extrabold text-primary-deep"
                  key={section.key}
                >
                  <span>{index + 1}</span>
                  {t(
                    `shortcutBookkeeping.usage.sections.${section.key}.shortTitle`,
                  )}
                </span>
              ))}
            </div>
          </Surface>
          {usageSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <section className="scroll-mt-4" key={section.key}>
                <div className="mb-3 flex items-center gap-3 px-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[14px] font-extrabold text-white">
                    {sectionIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ww-ink">
                      {t(
                        `shortcutBookkeeping.usage.sections.${section.key}.title`,
                      )}
                    </h3>
                    <p className="text-[11px] text-ww-soft">
                      {t(
                        `shortcutBookkeeping.usage.sections.${section.key}.description`,
                      )}
                    </p>
                  </div>
                  <Icon className="ml-auto text-primary-deep" size={21} />
                </div>
                <Surface className="overflow-hidden" material="content">
                  {section.images.map((image, imageIndex) => (
                    <figure
                      className={
                        imageIndex
                          ? 'border-t border-solid border-border-primary'
                          : ''
                      }
                      key={image}
                    >
                      <img
                        alt={t(
                          `shortcutBookkeeping.usage.sections.${section.key}.imageAlt`,
                        )}
                        className="block w-full bg-black object-contain"
                        loading="lazy"
                        src={image}
                      />
                      <figcaption className="px-4 py-3 text-[12px] leading-5 text-ww-mid">
                        <span className="mr-1 font-extrabold text-primary-deep">
                          {sectionIndex + 1}
                          .
                          {imageIndex + 1}
                        </span>
                        {t(
                          `shortcutBookkeeping.usage.sections.${section.key}.captions.${imageIndex}`,
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </Surface>
              </section>
            );
          })}
          <Surface className="px-4 py-4" material="content">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 text-primary-deep" size={22} />
              <div>
                <h3 className="text-[14px] font-extrabold text-ww-ink">
                  {t('shortcutBookkeeping.usage.confirm.title')}
                </h3>
                <p className="mt-1 whitespace-pre-line text-[12px] leading-5 text-ww-mid">
                  {t('shortcutBookkeeping.usage.confirm.description')}
                </p>
              </div>
            </div>
          </Surface>
        </div>
      );
    }
    if (view === 'connections')
      return renderConnections();
    if (view === 'faq')
      return renderFaq();
    return renderOverview();
  };

  return (
    <div className="page-new relative overflow-hidden">
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => void handleBack()}
        title={t('shortcutBookkeeping.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[560px]">{renderContent()}</div>
      </main>
    </div>
  );
}
