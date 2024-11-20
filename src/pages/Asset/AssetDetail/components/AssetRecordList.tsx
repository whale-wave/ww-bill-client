import { List } from 'antd-mobile';
import type { FC } from 'react';
import { Icon } from '@/components';

export const AssetRecordList: FC = () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between px-3">
        <div className="text-base font-bold">收支明细</div>
        <div className="flex items-center text-xm space-x-1">
          <div>2024年11月</div>
          <Icon name="show-bottom" className="text-[10px]" />
        </div>
      </div>
      <List header="11月20日 星期三">
        {
          list.map(item => (
            <List.Item key={item} description="从 2834 调整为 9128312" prefix={<div className="text-[20px] rounded-full bg-gray-50 w-[40px] h-[40px] flex items-center justify-center"><Icon name="budget" /></div>} extra="-8234234">
              手动调整欠款
            </List.Item>
          ),
          )
        }
      </List>
    </div>
  );
};
