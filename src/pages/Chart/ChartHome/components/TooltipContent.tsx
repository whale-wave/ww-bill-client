import type { FC } from 'react';
import { cn } from '@/utils';

export const TooltipContent: FC<{ data: any }> = ({ data }) => {
  const list = [1, 2, 3];

  return (
    <div className={cn('text-xs')}>
      <div className={cn('text-[#fff] bg-[#4e4c4d] py-1 flex items-center justify-center rounded-md')}>最大3笔交易</div>
      <div className={cn('flex flex-col mt-2 mb-1')}>
        {list.map(item => (
          <div key={item} className={cn('flex items-center h-[24px] space-x-3')}>
            <div className={cn('w-[16px] h-[16px] bg-primary rounded-full')} />
            <div>24/12/18</div>
            <div className={cn('flex-grow w-[60px]')}>交通</div>
            <div>{data}</div>
          </div>
        ))}
      </div>
      <div>当月总支出: xxxx</div>
    </div>
  );
};
