import type { StatusTabOption } from '../constants';
import React, { memo } from 'react';
import { FixedExpenseStatus } from '@/entities/fixed-expense';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';

interface FilterTabsProps {
  className?: string;
  value: StatusTabOption['key'];
  counts?: Partial<Record<StatusTabOption['key'], number>>;
  onChange: (value: StatusTabOption['key']) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = memo((props) => {
  const { t } = useTranslation('fixed-expense');
  const { className, value, counts, onChange } = props;

  const tabs = [
    { key: 'all' as const, labelKey: 'list.all' },
    { key: FixedExpenseStatus.ACTIVE, labelKey: 'status.active' },
    { key: FixedExpenseStatus.PAUSED, labelKey: 'status.paused' },
    { key: FixedExpenseStatus.EXPIRED, labelKey: 'status.expired' },
  ];

  return (
    <div
      className={cn(
        className,
        'flex items-center space-x-2 overflow-x-auto whitespace-nowrap px-1 py-1',
      )}
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        const count = counts?.[tab.key];
        return (
          <div
            key={tab.key}
            className={cn(
              'flex-shrink-0 cursor-pointer rounded-full px-3 py-1 text-[12px] transition-colors',
              active
                ? 'font-medium text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-500',
            )}
            style={active ? { backgroundColor: '#4fa9dc' } : undefined}
            onClick={() => onChange(tab.key)}
          >
            <span>{t(tab.labelKey)}</span>
            {typeof count === 'number' && (
              <span className={cn('ml-1', active ? 'text-white/85' : 'opacity-70')}>
                ·
                {' '}
                {count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default FilterTabs;
