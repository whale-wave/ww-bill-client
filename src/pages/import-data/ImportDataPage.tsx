import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  FileText,
  FileUp,
  MessageSquarePlus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { AppSheet, PageHeader, SheetHeader, Surface } from '@/shared/ui';
import { showAppNotice } from '@/shared/ui/app-feedback';

interface AppImportOption {
  badge?: string;
  bgGradient: string;
  descKey: string;
  iconBg: string;
  iconColor: string;
  id: string;
  titleKey: string;
}

const SUPPORTED_APPS: AppImportOption[] = [
  {
    id: 'shark',
    titleKey: 'importData.apps.shark',
    descKey: 'importData.apps.sharkDesc',
    badge: '热门软件',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgGradient: 'from-amber-500/5 to-transparent',
  },
  {
    id: 'icost',
    titleKey: 'importData.apps.icost',
    descKey: 'importData.apps.icostDesc',
    badge: 'iOS 精选',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgGradient: 'from-purple-500/5 to-transparent',
  },
  {
    id: 'yimu',
    titleKey: 'importData.apps.yimu',
    descKey: 'importData.apps.yimuDesc',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgGradient: 'from-emerald-500/5 to-transparent',
  },
  {
    id: 'qianji',
    titleKey: 'importData.apps.qianji',
    descKey: 'importData.apps.qianjiDesc',
    badge: '推荐迁移',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgGradient: 'from-blue-500/5 to-transparent',
  },
  {
    id: 'wechatAlipay',
    titleKey: 'importData.apps.wechatAlipay',
    descKey: 'importData.apps.wechatAlipayDesc',
    badge: '官方对账',
    iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconColor: 'text-teal-600 dark:text-teal-400',
    bgGradient: 'from-teal-500/5 to-transparent',
  },
  {
    id: 'other',
    titleKey: 'importData.apps.other',
    descKey: 'importData.apps.otherDesc',
    badge: '自定义格式',
    iconBg: 'bg-primary-light/60',
    iconColor: 'text-primary-deep',
    bgGradient: 'from-primary/5 to-transparent',
  },
];

const SUPPORT_EMAIL = 'support@whalewave.com';

export default function ImportDataPage() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<AppImportOption | null>(null);

  const handleSelectApp = (app: AppImportOption) => {
    playSound.turnPage();
    setSelectedApp(app);
  };

  const handleGoToFeedback = () => {
    playSound.turnPage();
    setSelectedApp(null);
    navigate(ROUTES_PATH.FEEDBACK.getPath());
  };

  const handleCopyEmail = async () => {
    playSound.turnPage();
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      showAppNotice(t('importData.copiedContact'));
    }
    catch {
      showAppNotice(SUPPORT_EMAIL);
    }
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-80 h-44 w-44 rounded-full bg-ww-pink/20 blur-3xl" />

      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('importData.title')}
      />

      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          {/* Header Banner */}
          <Surface className="mb-5 flex items-center gap-3.5 px-4 py-4" material="raised">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/80 bg-white/70 text-primary-deep shadow-ww-xs">
              <FileUp size={22} strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('importData.title')}</h2>
              <p className="mt-0.5 text-[11px] leading-4 text-ww-mid">{t('importData.subtitle')}</p>
            </div>
          </Surface>

          {/* Section Header */}
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h3 className="text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">
              {t('importData.supportedApps')}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-light/40 px-2 py-0.5 text-[10px] font-bold text-primary-deep">
              <Sparkles size={11} />
              全力攻坚适配中
            </span>
          </div>

          {/* App List Card */}
          <Surface className="overflow-hidden p-1.5" material="content">
            <div className="space-y-1">
              {SUPPORTED_APPS.map((app) => {
                const appTitle = t(app.titleKey);
                const appDesc = t(app.descKey);
                return (
                  <button
                    className="group flex w-full items-center gap-3.5 rounded-[16px] border border-transparent p-3 text-left transition-all hover:border-border-primary hover:bg-white/60 active:scale-[0.99]"
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    type="button"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${app.iconBg} ${app.iconColor} shadow-ww-xs transition-transform group-hover:scale-105`}>
                      {app.id === 'other' ? <FileSpreadsheet size={21} strokeWidth={1.8} /> : <FileText size={21} strokeWidth={1.8} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-extrabold text-ww-ink">{appTitle}</span>
                        {app.badge && (
                          <span className="rounded-md bg-ww-surface-tint px-1.5 py-0.5 text-[9px] font-bold text-ww-mid">
                            {app.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] leading-4 text-ww-soft">{appDesc}</p>
                    </div>

                    <ChevronRight className="text-ww-soft transition-transform group-hover:translate-x-0.5" size={18} />
                  </button>
                );
              })}
            </div>
          </Surface>

          {/* Trust Banner */}
          <div className="mt-5 rounded-[18px] border border-border-primary/80 bg-white/45 p-4 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-primary-deep" size={20} strokeWidth={1.8} />
              <div>
                <h4 className="text-[12px] font-bold text-ww-ink">适配开发与模版征集说明</h4>
                <p className="mt-1 text-[11px] leading-4 text-ww-soft">
                  作者团队正在全力开发与攻坚各大记账 App 的一键导入功能。欢迎联系作者提供模版，我们将为您优先加急开发并上线该软件的导入支持！
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Support Notice Sheet */}
      <AppSheet
        bodyClassName="max-h-[85dvh]"
        destroyOnClose
        onClose={() => setSelectedApp(null)}
        onMaskClick={() => setSelectedApp(null)}
        position="bottom"
        showCloseButton={false}
        visible={selectedApp !== null}
      >
        {selectedApp && (
          <div className="flex flex-col px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
            <SheetHeader
              closeLabel={t('common:nav.close')}
              description={t('importData.subtitle')}
              icon={<Sparkles className="text-amber-500" size={22} />}
              onClose={() => setSelectedApp(null)}
              title={t('importData.noticeTitle')}
            />

            <div className="mt-4 space-y-4">
              {/* App Badge Pill */}
              <div className="flex items-center gap-3 rounded-[16px] border border-border-primary bg-primary-light/25 p-3.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${selectedApp.iconBg} ${selectedApp.iconColor}`}>
                  <CheckCircle2 size={20} strokeWidth={2} />
                </span>
                <div>
                  <h4 className="text-[14px] font-extrabold text-ww-ink">
                    【
                    {t(selectedApp.titleKey)}
                    】导入功能全力开发中
                  </h4>
                  <p className="mt-0.5 text-[11px] text-ww-mid">提供模版可优先加急上线</p>
                </div>
              </div>

              {/* Notice Body */}
              <div className="rounded-[16px] bg-ww-surface-raised p-4 text-[12px] leading-6 text-ww-mid shadow-ww-xs border border-border-primary/60">
                {t('importData.noticeDescription')}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[16px] bg-primary text-[14px] font-extrabold text-white shadow-ww transition-transform active:scale-[0.98]"
                  onClick={handleGoToFeedback}
                  type="button"
                >
                  <MessageSquarePlus size={18} />
                  {t('importData.sendTemplate')}
                  <ArrowRight size={16} />
                </button>

                <button
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white/80 text-[13px] font-bold text-ww-ink shadow-ww-xs transition-colors hover:bg-white active:scale-[0.98]"
                  onClick={handleCopyEmail}
                  type="button"
                >
                  <Copy size={16} />
                  复制作者邮箱 (
                  {SUPPORT_EMAIL}
                  )
                </button>
              </div>
            </div>
          </div>
        )}
      </AppSheet>
    </div>
  );
}
