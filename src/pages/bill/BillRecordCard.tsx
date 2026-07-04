import type { FC } from 'react';
import type { Bill } from '@/entities/record';
import { Card } from 'antd-mobile';
import { useMemo } from 'react';
import { useBillPageStore } from '@/pages/bill/store';
import { BillTabsType } from '@/pages/bill/typs';
import { mergerProps } from '@/shared/lib';

const defaultProps = {
  data: {
    income: 0,
    expand: 0,
    balance: 0,
  },
};

export const BillRecordCard: FC<{ data?: Bill }> = (p) => {
  const { data } = mergerProps({ ...defaultProps }, p);

  const billTabType = useBillPageStore(({ billTabType }) => billTabType);
  const isMonth = useMemo(() => billTabType === BillTabsType.MONTH, [billTabType]);

  return (
    <Card className="!bg-primary !py-2 !px-[12px] mb-2 text-[12px]" bodyClassName="space-y-2 !px-2 ">
      <div>
        {isMonth ? '年' : '总'}
        结余
      </div>
      <div className="text-[24px] font-bold">{data?.balance || 0}</div>
      <div className="flex">
        <div className="w-[50%] space-x-1">
          <span>
            {isMonth ? '年' : '总'}
            收入
          </span>
          <span className="text-[15px] font-bold">{data?.income || 0}</span>
        </div>
        <div className="w-[50%] space-x-1">
          <span>
            {isMonth ? '年' : '总'}
            支出
          </span>
          <span className="text-[15px] font-bold">{data?.expand || 0}</span>
        </div>
      </div>
    </Card>
  );
};
