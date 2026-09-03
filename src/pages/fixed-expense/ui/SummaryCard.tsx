import type { FixedExpenseSummary } from '@/entities/fixed-expense';
import React, { memo } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Surface } from '@/shared/ui';
import { formatThousands } from '../utils';

interface SummaryCardProps {
  className?: string;
  summary: FixedExpenseSummary;
  totalCount: number;
  activeCount: number;
}

const SummaryCard: React.FC<SummaryCardProps> = memo((props) => {
  const { t } = useTranslation('fixed-expense');
  const { className, summary, totalCount, activeCount } = props;

  return (
    <Surface
      className={cn(
        className,
        'relative overflow-hidden px-5 py-5',
      )}
      material="raised"
    >
      <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[20px] border-solid border-white/25" />

      <div className="relative text-ww-ink">
        <div className="text-[11px] font-bold text-ww-mid">{t('summary.monthlyExpected')}</div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-[15px] font-extrabold text-primary-deep">¥</span>
          <span className="text-[28px] font-black leading-none tracking-[-0.5px] text-ww-ink">
            {formatThousands(summary.monthlyTotal)}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-[16px] border border-white/80 bg-white/55 p-3 backdrop-blur-xl">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-ww-soft">{t('summary.yearlyTotal')}</span>
            <span className="mt-1 text-[11px] font-extrabold text-ww-ink">
              ¥
              {formatThousands(summary.yearlyTotal)}
            </span>
          </div>
          <div className="flex flex-col border-0 border-l border-solid border-border-primary pl-2">
            <span className="text-[9px] font-bold text-ww-soft">{t('summary.active')}</span>
            <span className="mt-1 text-[11px] font-extrabold text-ww-ink">
              ¥
              {formatThousands(summary.activeMonthlyTotal)}
            </span>
          </div>
          <div className="flex flex-col border-0 border-l border-solid border-border-primary pl-2">
            <span className="text-[9px] font-bold text-ww-soft">{t('summary.itemCount')}</span>
            <span className="mt-1 text-[11px] font-extrabold text-ww-ink">
              {activeCount}
              {' '}
              /
              {' '}
              {totalCount}
            </span>
          </div>
        </div>
      </div>
    </Surface>
  );
});

export default SummaryCard;
