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
import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LedgerCapability, LedgerKind, useGetLedgersQuery } from '@/entities/ledger';
import { uploadSharkImport } from '@/entities/record-import';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { AppButton, AppSheet, PageHeader, SelectField, SheetHeader, Surface } from '@/shared/ui';
import { showAppError, showAppNotice } from '@/shared/ui/app-feedback';
import './shark-import.scss';

interface AppImportOption {
  descKey: string;
  iconBg: string;
  iconColor: string;
  id: string;
  titleKey: string;
}

const OTHER_APPS: AppImportOption[] = [
  {
    id: 'icost',
    titleKey: 'importData.apps.icost',
    descKey: 'importData.apps.icostDesc',
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'yimu',
    titleKey: 'importData.apps.yimu',
    descKey: 'importData.apps.yimuDesc',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'qianji',
    titleKey: 'importData.apps.qianji',
    descKey: 'importData.apps.qianjiDesc',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'wechatAlipay',
    titleKey: 'importData.apps.wechatAlipay',
    descKey: 'importData.apps.wechatAlipayDesc',
    iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'other',
    titleKey: 'importData.apps.other',
    descKey: 'importData.apps.otherDesc',
    iconBg: 'bg-primary-light/60',
    iconColor: 'text-primary-deep',
  },
];

const SUPPORT_EMAIL = 'support@whalewave.com';

export default function ImportDataPage() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ledgersQuery = useGetLedgersQuery();
  const availableLedgers = ledgersQuery.data.filter(ledger => ledger.capabilities.includes(LedgerCapability.RECORD_CREATE));
  const [selectedLedgerId, setSelectedLedgerId] = useState(() => searchParams.get('ledgerId') ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppImportOption | null>(null);
  const targetLedgerId = availableLedgers.some(ledger => ledger.id === selectedLedgerId)
    ? selectedLedgerId
    : !selectedLedgerId && availableLedgers.length === 1 ? availableLedgers[0].id : '';
  const targetLedger = availableLedgers.find(ledger => ledger.id === targetLedgerId);

  const handleSharkFile = async (file: File | undefined) => {
    if (!file || !targetLedgerId || isUploading)
      return;
    setIsUploading(true);
    try {
      const preview = await uploadSharkImport(targetLedgerId, file);
      setSelectedApp(null);
      navigate(ROUTES_PATH.SHARK_IMPORT_PREVIEW.getPath(targetLedgerId, preview.id), { state: { fromImportData: true } });
    }
    catch (error) {
      showAppError(error);
    }
    finally {
      setIsUploading(false);
    }
  };

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
    <div className="shark-import-entry page-new relative overflow-hidden">

      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('importData.title')}
      />

      <main className="min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto w-full max-w-[520px]">
          <Surface className="p-4" material="raised">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary-light text-primary-deep">
                <FileSpreadsheet size={22} strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-extrabold text-ww-ink">导入鲨鱼记账</h2>
                <p className="mt-0.5 text-[12px] leading-5 text-ww-mid">上传 CSV 后逐条核对，再确认写入账本</p>
              </div>
            </div>

            <SelectField
              className="mt-5"
              label="导入到哪个账本"
              onChange={setSelectedLedgerId}
              options={availableLedgers.map(ledger => ({ label: ledger.name, value: ledger.id }))}
              placeholder="请选择账本"
              value={targetLedgerId}
            />
            {targetLedger?.kind !== LedgerKind.SYSTEM_DEFAULT && targetLedger && (
              <p className="mt-2 text-[12px] leading-5 text-ww-mid">此账本不支持关联个人资产。预览会展示原账户供核对，导入时自动不关联资产。</p>
            )}
            {!ledgersQuery.isLoading && availableLedgers.length === 0 && (
              <p className="mt-2 text-[12px] leading-5 text-feedback-danger">当前没有可导入的账本，或你没有记账权限。</p>
            )}
            <input
              accept=".csv,text/csv"
              aria-label="选择鲨鱼记账 CSV 文件"
              className="sr-only"
              disabled={!targetLedgerId || isUploading}
              onChange={(event) => {
                void handleSharkFile(event.target.files?.[0]);
                event.target.value = '';
              }}
              ref={fileInputRef}
              type="file"
            />
            <AppButton className="mt-5" disabled={!targetLedgerId} fullWidth loading={isUploading} loadingLabel="正在分析文件…" onClick={() => fileInputRef.current?.click()} size="large">
              <FileUp aria-hidden="true" size={18} />
              选择 CSV 文件
            </AppButton>
            <p className="mt-3 text-center text-[12px] leading-5 text-ww-mid">支持鲨鱼记账导出的 CSV；上传不会直接导入</p>
          </Surface>

          <div className="mb-3 mt-6 px-1">
            <h3 className="text-[14px] font-extrabold text-ww-ink">其他记账软件</h3>
            <p className="mt-1 text-[12px] text-ww-mid">仍在适配，欢迎提供导出模板</p>
          </div>

          <Surface className="overflow-hidden p-1.5" material="content">
            <div className="space-y-1">
              {OTHER_APPS.map((app) => {
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
                      </div>
                      <p className="mt-0.5 truncate text-[11px] leading-4 text-ww-soft">{appDesc}</p>
                    </div>

                    <ChevronRight className="text-ww-soft transition-transform group-hover:translate-x-0.5" size={18} />
                  </button>
                );
              })}
            </div>
          </Surface>

          <div className="mt-5 rounded-[18px] border border-border-primary/80 bg-white/75 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-primary-deep" size={20} strokeWidth={1.8} />
              <div>
                <h4 className="text-[12px] font-bold text-ww-ink">适配开发与模版征集说明</h4>
                <p className="mt-1 text-[11px] leading-4 text-ww-soft">
                  其他软件的导出格式还在适配。可以提供一份脱敏模板，帮助我们确定字段与导入规则。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppSheet
        bodyClassName="shark-import-other-app-sheet max-h-[85dvh]"
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
