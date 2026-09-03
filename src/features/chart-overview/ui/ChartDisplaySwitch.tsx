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
      className={`ww-chart-display-switch inline-flex items-center border p-[2px] ${compact ? 'origin-right' : ''}`}
      data-chart-display-switch
      role="group"
    >
      {options.map(option => (
        <button
          aria-pressed={option.value === value}
          className={`ww-chart-display-switch__option relative -my-2 flex h-11 items-center justify-center border-0 bg-transparent font-bold transition-colors ${compact ? 'min-w-[44px] px-2 text-[11px] leading-4' : 'min-w-[52px] px-3 text-[12px] leading-[18px]'} ${option.value === value ? 'ww-chart-display-switch__option--active' : ''}`}
          data-chart-display-option={option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          <span className="relative z-[1]">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
