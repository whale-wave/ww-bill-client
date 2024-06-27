import { Card } from 'antd-mobile';
import type { FC } from 'react';
import { useMemo } from 'react';
import { mergerProps } from '@/utils';
import type { Bill } from '@/api';
import { BillTabsType } from '@/pages/Bill/typs';
import { useBillPageStore } from '@/pages/Bill/store';

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
    <Card className="bg-primary py-2 mb-2" bodyClassName="space-y-1 px-2">
      <div>
        {isMonth ? '年' : '总'}
        结余
      </div>
      <div className="text-lg">{data?.balance || 0}</div>
      <div className="flex">
        <div className="w-[50%] space-x-1">
          <span>
            {isMonth ? '年' : '总'}
            收入
          </span>
          <span>{data?.income || 0}</span>
        </div>
        <div className="w-[50%] space-x-1">
          <span>
            {isMonth ? '年' : '总'}
            支出
          </span>
          <span>{data?.expand || 0}</span>
        </div>
      </div>
    </Card>
  );
};
