import type { StatusTabOption } from '../constants';
import React, { memo } from 'react';
import { cn } from '@/utils';
import { statusTabOptions } from '../constants';

interface FilterTabsProps {
  className?: string;
  value: StatusTabOption['key'];
  counts?: Partial<Record<StatusTabOption['key'], number>>;
  onChange: (value: StatusTabOption['key']) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = memo((props) => {
  const { className, value, counts, onChange } = props;

  return (
    <div
      className={cn(
        className,
        'flex items-center space-x-2 overflow-x-auto whitespace-nowrap px-1 py-1',
      )}
    >
      {statusTabOptions.map((tab) => {
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
            <span>{tab.label}</span>
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
