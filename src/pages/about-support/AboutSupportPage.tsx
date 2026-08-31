import type { FC, ReactNode } from 'react';
import { Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import {
  ChevronRight,
  Clipboard,
  Globe2,
  MessageCircle,
} from 'lucide-react';
import androidLogo from '@/assets/brand/android-logo.png';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { APP_INFO } from '@/shared/config/app-info';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui';

interface SupportRowProps {
  description?: ReactNode;
  href?: string;
  icon: ReactNode;
  id: string;
  label: ReactNode;
  onClick?: () => void;
  value?: ReactNode;
}

const SupportRow: FC<SupportRowProps> = ({
  description,
  href,
  icon,
  id,
  label,
  onClick,
  value,
}) => {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-primary-light/55 text-primary-deep">
        {icon}
      </span>
      <span className="min-w-0 flex-1 py-2">
        <span className="block text-[13px] font-bold leading-5 text-ww-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[10px] leading-4 text-ww-soft">{description}</span>}
      </span>
      {value && <span className="max-w-[45%] truncate text-xs text-ww-soft">{value}</span>}
      <ChevronRight className="shrink-0 text-[#C3C6C9]" size={18} />
    </>
  );

  const className = 'flex min-h-[64px] w-full items-center gap-3 border-0 bg-transparent px-4 text-left active:bg-primary-light/20';

  if (href) {
    return (
      <a
        className={className}
        data-about-row={id}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <button className={className} data-about-row={id} onClick={onClick} type="button">
      {content}
    </button>
  );
};

const SupportSection: FC<{ children: ReactNode; title: ReactNode }> = ({ children, title }) => (
  <section>
    <h2 className="px-1 pb-2 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">{title}</h2>
    <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] shadow-ww backdrop-blur-xl">
      {children}
    </div>
  </section>
);

const AboutSupportPage: FC = () => {
  const { t } = useTranslation('settings');
  const onBack = useWorkspaceBack({ type: 'personal' });

  const handleCopy = (text: string) => {
    if (copy(text)) {
      Toast.show({ content: t('aboutSupport.copied'), icon: 'success' });
      return;
    }
    Toast.show({ content: t('aboutSupport.openFailed'), icon: 'fail' });
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-[58%] h-48 w-48 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} title={t('aboutSupport.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px] space-y-5">
          <div className="flex items-center gap-3.5 rounded-[20px] border border-border-primary bg-white/[0.84] px-5 py-5 shadow-ww backdrop-blur-xl">
            <img alt="" className="h-14 w-14 rounded-[17px] object-cover" src={androidLogo} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] font-extrabold text-ww-ink">{APP_INFO.appName}</h2>
              <p className="mt-1 text-[11px] leading-4 text-ww-mid">{t('aboutSupport.description')}</p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-light/65 px-2.5 py-1 font-display text-[11px] font-bold text-primary-deep">
              v
              {APP_INFO.version}
            </span>
          </div>

          <SupportSection title={t('aboutSupport.officialChannels')}>
            <SupportRow
              description={t('aboutSupport.githubDesc')}
              href={APP_INFO.githubProfileUrl}
              icon={<Globe2 size={18} strokeWidth={1.8} />}
              id="github"
              label={t('aboutSupport.github')}
            />
          </SupportSection>

          <SupportSection title={t('aboutSupport.contact')}>
            <SupportRow
              description={t('aboutSupport.qqGroupDesc')}
              href={APP_INFO.qqGroupJoinUrl}
              icon={<MessageCircle size={18} strokeWidth={1.8} />}
              id="qq-group"
              label={t('aboutSupport.qqGroup')}
              value={t('aboutSupport.qqNumber', { number: APP_INFO.qqGroupNumber })}
            />
            <SupportRow
              description={t('aboutSupport.qqNumber', { number: APP_INFO.qqGroupNumber })}
              icon={<Clipboard size={18} strokeWidth={1.8} />}
              id="copy-qq-number"
              label={t('aboutSupport.copyGroupNumber')}
              onClick={() => handleCopy(APP_INFO.qqGroupNumber)}
            />
          </SupportSection>

          <p className="px-2 pb-2 text-center text-[11px] leading-5 text-ww-soft">{t('aboutSupport.officialHint')}</p>
        </div>
      </main>
    </div>
  );
};

export default AboutSupportPage;
