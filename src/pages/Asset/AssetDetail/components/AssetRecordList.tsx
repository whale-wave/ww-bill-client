import { List } from 'antd-mobile';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@/components';
import { useGetAssetRecordQuery } from '@/hooks';

export const AssetRecordList: FC = () => {
  const params = useParams();
  const { id } = params as { id: string };

  const { data } = useGetAssetRecordQuery({ params: id });

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
          data
            ? data.map(record => (
              <List.Item key={record.id} description={record.comment} prefix={<div className="text-[20px] rounded-full bg-gray-50 w-[40px] h-[40px] flex items-center justify-center"><Icon name="budget" /></div>} extra={record.amount}>
                {record.name}
              </List.Item>
            ),
            )
            : null
        }
      </List>
    </div>
  );
};
