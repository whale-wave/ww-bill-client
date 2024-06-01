import { Card } from 'antd-mobile';
import { FC } from 'react';
import { mergerProps } from '@/utils';
import { Bill } from '@/api';

const defaultProps = {
  data: {
    income: 0,
    expand: 0,
    balance: 0,
  },
};

export const BillRecordCard: FC<{ data?: Bill }> = (p) => {
  const { data } = mergerProps({ ...defaultProps }, p);
  return (
    <Card className={'bg-primary py-2 mb-2'} bodyClassName={'space-y-1 px-2'}>
      <div>年结余</div>
      <div className={'text-lg'}>{data.balance}</div>
      <div className={'flex'}>
        <div className={'w-[50%] space-x-1'}>
          <span>年收入</span>
          <span>{data.income}</span>
        </div>
        <div className={'w-[50%] space-x-1'}>
          <span>年支出</span>
          <span>{data.expand}</span>
        </div>
      </div>
    </Card>
  );
};
