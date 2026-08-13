import type { PropsWithChildren, ReactNode } from 'react';
import { ArrowLeft, Languages } from 'lucide-react';
import appLogo from '@/assets/brand/whale-logo-surface.png';
import { changeLanguage, useTranslation } from '@/shared/i18n';
import { GradientPanel } from '@/shared/ui';

interface AuthPageShellProps {
  footer?: ReactNode;
  kicker?: ReactNode;
  onBack?: () => void;
  subtitle: ReactNode;
  title: ReactNode;
}

export function AuthPageShell({
  children,
  footer,
  kicker,
  onBack,
  subtitle,
  title,
}: PropsWithChildren<AuthPageShellProps>) {
  const { i18n, t } = useTranslation('auth');
  const isChinese = (i18n.resolvedLanguage ?? i18n.language).toLowerCase().startsWith('zh');
  const handleLanguageChange = () => void changeLanguage(isChinese ? 'en' : 'zh-CN');

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-24 h-48 w-48 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-[38%] h-52 w-52 rounded-full bg-ww-pink-light/35 blur-3xl" />
      <header className="relative z-10 flex h-[60px] shrink-0 items-center justify-between px-[18px] pb-3 pt-[max(8px,env(safe-area-inset-top))]">
        {onBack
          ? (
              <button
                aria-label={t('common:nav.back')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
                onClick={onBack}
                type="button"
              >
                <ArrowLeft size={17} strokeWidth={2} />
              </button>
            )
          : <span className="h-9 w-9" />}
        <button
          aria-label={t('languageSwitch')}
          className="flex h-9 items-center gap-1.5 rounded-full border border-solid border-border-primary bg-white/80 px-3 text-[12px] font-bold text-primary-deep shadow-ww-xs"
          data-testid="auth-language-switch"
          onClick={handleLanguageChange}
          type="button"
        >
          <Languages size={15} strokeWidth={1.9} />
          <span>{isChinese ? 'EN' : '中文'}</span>
        </button>
      </header>
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="flex items-center gap-3.5 px-1 pb-4 pt-1 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/80 shadow-ww-sm">
              <img alt="" className="h-full w-full object-cover" src={appLogo} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2.5">
                <h1 className="shrink-0 text-[22px] font-black leading-8 text-ww-ink">{title}</h1>
                {kicker && (
                  <span className="truncate text-[10px] font-bold tracking-[0.7px] text-primary-deep/75">
                    {kicker}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[12px] leading-[18px] text-ww-mid">{subtitle}</p>
            </div>
          </div>
          <GradientPanel className="px-5 py-[22px]" elevation="high" surface="glass">
            {children}
          </GradientPanel>
          {footer && <div className="px-2 pt-5 text-center text-[13px] leading-5 text-ww-mid">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
