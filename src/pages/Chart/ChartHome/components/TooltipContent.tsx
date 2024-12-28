import { type FC, useMemo } from 'react';
import { format, formatDate } from 'date-fns';
import { cn } from '@/utils';
import type { GetChartApiResponseWeekDataWeekItemDayItem } from '@/api';
import { Icon } from '@/components';

export const TooltipContent: FC<{ data: GetChartApiResponseWeekDataWeekItemDayItem }> = ({ data }) => {
  const list = useMemo(() => {
    return data.data.slice(0, 3);
  }, [data]);

  if (list.length === 0)
    return <div className={cn('py-1 px-7')}>没有费用</div>;

  return (
    <div className={cn('text-xs')}>
      <div className={cn('text-[#fff] bg-[#4e4c4d] py-1 flex items-center justify-center rounded-md')}>最大3笔交易</div>
      <div className={cn('flex flex-col mt-2 mb-1')}>
        {list.map(item => (
          <div key={item.id} className={cn('flex items-center h-[24px] space-x-3')}>
            <div className={cn('w-[18px] h-[18px] text-[#333] bg-gray-200 rounded-full flex items-center justify-center')}>
              <Icon name={item.category.icon} />
            </div>
            <div>{format(item.time, 'yy/MM/dd')}</div>
            <div className={cn('flex-grow w-[60px]')}>{item.category.name}</div>
            <div>{item.amount}</div>
          </div>
        ))}
      </div>
      <div className={cn('flex space-x-2')}>
        <div>当月总支出:</div>
        <div>{data.amount}</div>
      </div>
    </div>
  );
};
