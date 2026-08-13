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
        'flex items-center gap-1 overflow-x-auto rounded-[15px] border border-border-primary bg-white/75 p-1 shadow-ww-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        const count = counts?.[tab.key];
        return (
          <button
            key={tab.key}
            className={cn(
              'h-9 flex-shrink-0 cursor-pointer rounded-[11px] border-0 px-3 text-[11px] font-bold transition-colors',
              active
                ? 'bg-primary text-white shadow-ww-xs'
                : 'bg-transparent text-ww-soft',
            )}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            <span>{t(tab.labelKey)}</span>
            {typeof count === 'number' && (
              <span className={cn('ml-1', active ? 'text-white/85' : 'opacity-70')}>
                ·
                {' '}
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

export default FilterTabs;
