import type { PropsWithChildren, ReactNode } from 'react';
import { AuthPresentation } from '@ww-bill/bill-ui';
import { ArrowLeft, Languages } from 'lucide-react';
import appLogo from '@/assets/brand/whale-logo-surface-浅色渐变背景.png';
import { changeLanguage, useTranslation } from '@/shared/i18n';
import { Surface } from '@/shared/ui';

interface AuthPageShellProps {
  footer?: ReactNode;
  kicker?: ReactNode;
  onBack?: () => void;
  subtitle?: ReactNode;
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
    <AuthPresentation
      title={title}
      subtitle={subtitle}
      kicker={kicker}
      footer={footer}
      logo={<img className="bill-auth__logo-image" alt="" src={appLogo} />}
      controls={(
        <>
          {onBack
            ? (
                <button
                  aria-label={t('common:nav.back')}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-solid border-border-primary bg-white/80 text-primary-deep shadow-ww-xs"
                  onClick={onBack}
                  type="button"
                >
                  <ArrowLeft size={17} strokeWidth={2} />
                </button>
              )
            : <span className="h-11 w-11" />}
          <button
            aria-label={t('languageSwitch')}
            className="flex h-11 items-center gap-1.5 rounded-full border border-solid border-border-primary bg-white/80 px-3 text-[12px] font-bold text-primary-deep shadow-ww-xs"
            data-testid="auth-language-switch"
            onClick={handleLanguageChange}
            type="button"
          >
            <Languages size={15} strokeWidth={1.9} />
            <span>{isChinese ? 'EN' : '中文'}</span>
          </button>
        </>
      )}
      surface={<Surface className="bill-auth__surface" material="raised">{children}</Surface>}
    />
  );
}
