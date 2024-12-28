import { type FC, useState } from 'react';
import { List } from 'antd-mobile';
import { RankingItem } from './RankingItem';
import { cn } from '@/utils';

export const RankingList: FC = () => {
  const [list, _setList] = useState<any[]>([{ id: 1, name: '张三', value: 100 }, { id: 2, name: '李四', value: 90 }, { id: 3, name: '王五', value: 80 }]);

  return (
    <div>
      <div className={cn('text-base px-3 pb-1 pt-2')}>支出排行榜</div>
      <List
        style={{ '--border-top': '0px', '--border-bottom': '0px' }}
      >
        {
          list.map(item => (
            <RankingItem key={item.id} onClick={() => {}} />
          ))
        }
      </List>
    </div>
  );
};
