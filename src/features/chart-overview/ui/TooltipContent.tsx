import type { FC } from 'react';
import type { ChartOverviewPoint } from '../model/chart-overview-context';
import type { AmountType } from '@/entities/chart';
import { format } from 'date-fns';
import { CalendarDays, ReceiptText } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryIcon } from '@/entities/category';

function formatCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match)
    return format(value, 'yy/MM/dd');

  return `${match[1].slice(-2)}/${match[2]}/${match[3]}`;
}

function formatTooltipAmount(amount: number | string) {
  return String(amount).replace(/^¥\s*/, '');
}

const tooltipCardClassName = 'min-w-[176px] max-w-[280px] overflow-hidden rounded-[18px] border border-solid border-[rgba(110,194,220,0.28)] bg-white/[0.96] p-3.5 text-ww-ink shadow-[0_12px_30px_rgba(46,92,120,0.2)] backdrop-blur-xl';

export const TooltipContent: FC<{ data: ChartOverviewPoint; currentAmountType: AmountType }> = ({ data, currentAmountType }) => {
  const { t } = useTranslation('chart');
  const list = useMemo(() => data.data.slice(0, 3), [data.data]);
  const totalLabel = currentAmountType === 'sub'
    ? t('tooltip.monthlyTotal.expend')
    : t('tooltip.monthlyTotal.income');

  if (data.tooltipMode === 'aggregate') {
    return (
      <div className={tooltipCardClassName} data-chart-tooltip="aggregate">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-ww-mid">
          <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-primary-light/60 text-primary-deep">
            <CalendarDays size={15} strokeWidth={1.8} />
          </span>
          <span>{data.displayLabel ?? formatCalendarDate(data.value)}</span>
        </div>
        <div className="mt-3 border-0 border-t border-solid border-border-primary pt-2.5">
          <div className="text-[10px] font-semibold text-ww-soft">{totalLabel}</div>
          <div className="mt-0.5 font-number text-[22px] font-black leading-7 text-ww-ink">
            <span className="mr-1 text-[12px] font-bold text-primary-deep">¥</span>
            {formatTooltipAmount(data.amount)}
          </div>
        </div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className={tooltipCardClassName} data-chart-tooltip="empty">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary-light/55 text-primary-deep">
            <ReceiptText size={18} strokeWidth={1.7} />
          </span>
          <div>
            <div className="text-[13px] font-bold text-ww-ink">{t('tooltip.noExpenses')}</div>
            <div className="mt-0.5 text-[10px] text-ww-soft">{data.displayLabel ?? formatCalendarDate(data.value)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={tooltipCardClassName} data-chart-tooltip="transactions">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-primary-light/60 text-primary-deep">
            <ReceiptText size={15} strokeWidth={1.8} />
          </span>
          <span className="text-[12px] font-extrabold text-ww-ink">{t('tooltip.top3Transactions')}</span>
        </div>
        <span className="shrink-0 text-[10px] font-semibold text-ww-soft">{data.displayLabel ?? formatCalendarDate(data.value)}</span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {list.map((item, index) => (
          <div className="flex min-w-0 items-center gap-2 rounded-[12px] bg-[#f6fafc] px-2 py-1.5" key={item.id}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${index % 3 === 1 ? 'bg-[#fff0f5] text-[#cf7894]' : index % 3 === 2 ? 'bg-[#f1ecff] text-[#8d78c7]' : 'bg-[#e4f5fa] text-primary-deep'}`}>
              <CategoryIcon categoryName={item.category.name} iconKey={item.category.icon} size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-ww-ink">{item.remark || item.category.name}</span>
              <span className="block text-[9px] text-ww-soft">{format(item.time, 'yy/MM/dd')}</span>
            </span>
            <span className="shrink-0 font-number text-[11px] font-extrabold text-ww-ink">
              ¥
              {formatTooltipAmount(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-3 border-0 border-t border-solid border-border-primary pt-2.5">
        <span className="text-[10px] font-semibold text-ww-soft">{totalLabel}</span>
        <span className="font-number text-[16px] font-black text-ww-ink">
          <span className="mr-0.5 text-[10px] font-bold text-primary-deep">¥</span>
          {formatTooltipAmount(data.amount)}
        </span>
      </div>
    </div>
  );
};
