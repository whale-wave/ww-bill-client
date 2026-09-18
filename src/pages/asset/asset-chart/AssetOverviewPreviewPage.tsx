import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { AppButton, PageHeader } from '@/shared/ui';
import styles from './AssetChart.module.scss';
import { overviewDemoAssets, overviewDemoGroups } from './model/asset-overview-demo';
import { AssetSankeyCard } from './ui/AssetSankey';

interface AssetOverviewPreviewPageProps {
  /** Used by the design studio to return to its preview index. */
  onBack?: () => void;
  /** Keeps the direct development route unchanged while exposing the scrollable navbar study. */
  studioNavigation?: boolean;
}

export default function AssetOverviewPreviewPage({ onBack, studioNavigation = false }: AssetOverviewPreviewPageProps) {
  const { t } = useTranslation('asset');
  const [scenario, setScenario] = useState<'normal' | 'deficit' | 'empty'>('normal');
  const assets = scenario === 'empty'
    ? []
    : scenario === 'deficit'
      ? overviewDemoAssets.filter(item => item.assetGroup.type === 'sub' || item.id === 'wallet')
      : overviewDemoAssets;

  return (
    <div
      className={`${styles['asset-chart']} page-new`}
      data-studio-navigation-example={studioNavigation || undefined}
    >
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} title={t('chart.overviewTitle')} />
      <main className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-8">
        <p className="mb-3 text-[12px] text-ww-mid">{t('chart.overviewDemo')}</p>
        <div aria-label={t('chart.overviewDemoScenario')} className="mb-3 flex flex-wrap gap-2">
          {(['normal', 'deficit', 'empty'] as const).map(value => (
            <AppButton
              aria-pressed={scenario === value}
              key={value}
              onClick={() => setScenario(value)}
              size="compact"
              variant={scenario === value ? 'primary' : 'secondary'}
            >
              {t(`chart.overviewDemo_${value}`)}
            </AppButton>
          ))}
        </div>
        <AssetSankeyCard assets={assets} groups={overviewDemoGroups} />
      </main>
    </div>
  );
}
