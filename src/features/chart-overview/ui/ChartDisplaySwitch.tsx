import type { FC } from 'react';
import type { ChartOverviewDisplay } from '../model/chart-overview-context';
import { useTranslation } from '@/shared/i18n';

interface ChartDisplaySwitchProps {
  compact?: boolean;
  value: ChartOverviewDisplay;
  onChange: (mode: ChartOverviewDisplay) => void;
}

export const ChartDisplaySwitch: FC<ChartDisplaySwitchProps> = ({ compact = false, value, onChange }) => {
  const { t } = useTranslation('chart');
  const options: Array<{ label: string; value: ChartOverviewDisplay }> = [
    { label: t('display.line'), value: 'line' },
    { label: t('display.pie'), value: 'pie' },
  ];

  return (
    <div
      aria-label={t('display.label')}
      className={`inline-flex rounded-full border border-border-primary bg-white/[0.84] p-1 shadow-ww-xs ${compact ? 'scale-[0.9] origin-right' : ''}`}
      data-chart-display-switch
      role="group"
    >
      {options.map(option => (
        <button
          aria-pressed={option.value === value}
          className={`rounded-full font-bold transition ${compact ? 'min-h-7 min-w-[48px] px-2 text-[11px] leading-4' : 'min-h-8 min-w-[52px] px-3 text-[12px] leading-[18px]'} ${option.value === value ? 'bg-primary-light text-primary-deep shadow-[0_2px_5px_rgba(60,140,180,0.12)]' : 'text-ww-soft'}`}
          data-chart-display-option={option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
