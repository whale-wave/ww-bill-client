import type { FixedExpenseSummary } from '@/entities/fixed-expense';
import React, { memo } from 'react';
import { cn } from '@/shared/lib';
import { formatThousands } from '../utils';

interface SummaryCardProps {
  className?: string;
  summary: FixedExpenseSummary;
  totalCount: number;
  activeCount: number;
}

const SummaryCard: React.FC<SummaryCardProps> = memo((props) => {
  const { className, summary, totalCount, activeCount } = props;

  return (
    <div
      className={cn(
        className,
        'relative overflow-hidden rounded-2xl p-4 shadow-md',
      )}
      style={{ background: 'linear-gradient(135deg, #5ab8e8 0%, #4fa9dc 52%, #3a87c4 100%)' }}
    >
      <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-white/15" />
      <div className="absolute -bottom-14 -left-6 h-28 w-28 rounded-full bg-white/10" />

      <div className="relative text-white">
        <div className="text-[12px] text-white/80">本月预计支出</div>
        <div className="mt-1 flex items-baseline space-x-1">
          <span className="text-[14px] font-medium text-white/90">¥</span>
          <span className="text-[30px] font-bold leading-none text-white drop-shadow-sm">
            {formatThousands(summary.monthlyTotal)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-white/20 p-3 text-[12px] backdrop-blur">
          <div className="flex flex-col">
            <span className="text-white/75">年化支出</span>
            <span className="mt-1 font-semibold text-white">
              ¥
              {formatThousands(summary.yearlyTotal)}
            </span>
          </div>
          <div className="flex flex-col border-l border-white/30 pl-2">
            <span className="text-white/75">生效中</span>
            <span className="mt-1 font-semibold text-white">
              ¥
              {formatThousands(summary.activeMonthlyTotal)}
            </span>
          </div>
          <div className="flex flex-col border-l border-white/30 pl-2">
            <span className="text-white/75">项数</span>
            <span className="mt-1 font-semibold text-white">
              {activeCount}
              {' '}
              /
              {' '}
              {totalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SummaryCard;
