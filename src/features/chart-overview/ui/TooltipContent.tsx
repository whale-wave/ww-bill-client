import type { FC } from 'react';
import type { ChartOverviewPoint } from '../model/chart-overview-context';
import type { AmountType } from '@/entities/chart';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib';
import { Icon } from '@/shared/ui';

function formatCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match)
    return format(value, 'yy/MM/dd');

  return `${match[1].slice(-2)}/${match[2]}/${match[3]}`;
}

export const TooltipContent: FC<{ data: ChartOverviewPoint; currentAmountType: AmountType }> = ({ data, currentAmountType }) => {
  const { t } = useTranslation('chart');
  const list = useMemo(() => {
    return data.data.slice(0, 3);
  }, [data]);

  if (data.tooltipMode === 'aggregate') {
    return (
      <div className={cn('text-xs')}>
        <div className={cn('text-[#fff] bg-[#4e4c4d] py-1 px-3 flex items-center justify-center rounded-md')}>
          {data.displayLabel ?? formatCalendarDate(data.value)}
        </div>
        <div className={cn('flex space-x-2 mt-2 mb-1')}>
          <div>{currentAmountType === 'sub' ? t('tooltip.monthlyTotal.expend') : t('tooltip.monthlyTotal.income')}</div>
          <div>{data.amount}</div>
        </div>
      </div>
    );
  }

  if (list.length === 0)
    return <div className={cn('py-1 px-7')}>{t('tooltip.noExpenses')}</div>;

  return (
    <div className={cn('text-xs')}>
      <div className={cn('text-[#fff] bg-[#4e4c4d] py-1 flex items-center justify-center rounded-md')}>{t('tooltip.top3Transactions')}</div>
      <div className={cn('flex flex-col mt-2 mb-1')}>
        {list.map(item => (
          <div key={item.id} className={cn('flex items-center h-[24px] space-x-3')}>
            <div className={cn('w-[18px] h-[18px] text-[#333] bg-gray-200 rounded-full flex items-center justify-center')}>
              <Icon name={item.category.icon} />
            </div>
            <div>{format(item.time, 'yy/MM/dd')}</div>
            <div className={cn('flex-grow w-[60px] truncate')}>{item.remark}</div>
            <div>{item.amount}</div>
          </div>
        ))}
      </div>
      <div className={cn('flex space-x-2')}>
        <div>{currentAmountType === 'sub' ? t('tooltip.monthlyTotal.expend') : t('tooltip.monthlyTotal.income')}</div>
        <div>{data.amount}</div>
      </div>
    </div>
  );
};
