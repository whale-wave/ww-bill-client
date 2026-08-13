import type { FC } from 'react';
import type { CategoryAmountType } from '@/entities/category';
import { SpinLoading } from 'antd-mobile';
import { FolderOpen, Info, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon, useGetCategoryQuery } from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { GradientPanel, IllustratedEmptyState, PageHeader } from '@/shared/ui';

const CategorySettings: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<CategoryAmountType>('sub');
  const subCategoryQuery = useGetCategoryQuery({ params: { type: 'sub' } });
  const addCategoryQuery = useGetCategoryQuery({ params: { type: 'add' } });
  const tabs = useMemo(() => [
    { key: 'sub' as const, label: t('amount.expend') },
    { key: 'add' as const, label: t('amount.income') },
  ], [t]);
  const activeQuery = activeKey === 'sub' ? subCategoryQuery : addCategoryQuery;
  const activeLabel = tabs.find(tab => tab.key === activeKey)?.label ?? '';

  const handleBack = () => {
    playSound.turnPage();
    navigate(-1);
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('nav.back')} onBack={handleBack} title={t('categorySettings.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-8">
        <div className="mx-auto w-full max-w-[520px]">
          <div className="mb-4 flex items-start gap-2 rounded-[16px] border border-solid border-primary-light bg-white/55 px-3.5 py-3 text-[10px] leading-4 text-ww-mid">
            <Info className="mt-0.5 shrink-0 text-primary-deep" size={15} />
            {t('categorySettings.notice')}
          </div>
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-[15px] border border-border-primary bg-white/75 p-1 shadow-ww-xs" role="tablist">
            {tabs.map(tab => (
              <button aria-selected={activeKey === tab.key} className={`h-10 rounded-[12px] border-0 text-[13px] font-bold ${activeKey === tab.key ? 'bg-primary text-white shadow-ww-xs' : 'bg-transparent text-ww-soft'}`} key={tab.key} onClick={() => setActiveKey(tab.key)} role="tab" type="button">{tab.label}</button>
            ))}
          </div>

          {activeQuery.isLoading && <div className="flex min-h-[300px] items-center justify-center"><SpinLoading color="primary" /></div>}
          {!activeQuery.isLoading && activeQuery.data.length > 0 && (
            <GradientPanel className="overflow-hidden px-4 py-1" elevation="standard" surface="glass">
              {activeQuery.data.map(item => (
                <div className="flex min-h-[66px] items-center gap-3 border-0 border-b border-solid border-border-primary last:border-b-0" key={item.id}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary-light/55 text-primary-deep"><CategoryIcon categoryName={item.name} iconKey={item.icon} size={19} /></span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[13px] text-ww-ink">{item.name}</strong>
                    <small className="mt-0.5 block text-[10px] text-ww-soft">
                      {activeLabel}
                      {t('categorySettings.category')}
                    </small>
                  </span>
                </div>
              ))}
            </GradientPanel>
          )}
          {!activeQuery.isLoading && (activeQuery.isError || !activeQuery.data.length) && (
            <GradientPanel elevation="low" surface="glass">
              <IllustratedEmptyState description={activeQuery.isError ? t('categorySettings.loadFailDesc') : t('categorySettings.emptyDesc')} accentIcon={<Plus size={18} />} icon={<FolderOpen className="text-primary-deep" size={38} />} title={activeQuery.isError ? t('categorySettings.loadFail') : t('categorySettings.empty')} />
            </GradientPanel>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategorySettings;
