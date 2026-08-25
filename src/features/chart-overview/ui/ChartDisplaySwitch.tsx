import type { FC } from 'react';
import type { ChartOverviewDisplay } from '../model/chart-overview-context';
import { useTranslation } from '@/shared/i18n';

interface ChartDisplaySwitchProps {
  value: ChartOverviewDisplay;
  onChange: (mode: ChartOverviewDisplay) => void;
}

export const ChartDisplaySwitch: FC<ChartDisplaySwitchProps> = ({ value, onChange }) => {
  const { t } = useTranslation('chart');
  const options: Array<{ label: string; value: ChartOverviewDisplay }> = [
    { label: t('display.line'), value: 'line' },
    { label: t('display.pie'), value: 'pie' },
  ];

  return (
    <div
      aria-label={t('display.label')}
      className="inline-flex rounded-full border border-border-primary bg-white/[0.84] p-1 shadow-ww-xs"
      data-chart-display-switch
      role="group"
    >
      {options.map(option => (
        <button
          aria-pressed={option.value === value}
          className={`min-h-8 min-w-[52px] rounded-full px-3 text-[12px] font-bold leading-[18px] transition ${option.value === value ? 'bg-primary-light text-primary-deep shadow-[0_2px_5px_rgba(60,140,180,0.12)]' : 'text-ww-soft'}`}
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
