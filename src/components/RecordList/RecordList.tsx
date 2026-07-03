import type { RecordEntry } from '@/entities/record';
import dayjs from 'dayjs';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordListItem } from '@/components';
import { math } from '@/shared/lib';

interface RecordItemGroupProps {
  data: {
    time: number;
    data: RecordEntry[];
  };
}

const RecordList: React.FC<RecordItemGroupProps> = memo((props) => {
  const { data } = props;
  const navigate = useNavigate();

  const amountInfo = useMemo(() => {
    const info = [
      {
        type: 'add',
        name: '收入',
        amount: 0,
      },
      {
        type: 'sub',
        name: '支出',
        amount: 0,
      },
    ];

    data.data.forEach((record) => {
      if (record.type === 'add')
        info[0].amount = math.add(info[0].amount, record.amount).toNumber();
      else
        info[1].amount = math.add(info[1].amount, record.amount).toNumber();
    });

    return info.filter(i => i.amount !== 0);
  }, [data]);

  const onRecordItemClick = useCallback((record: RecordEntry) => () => {
    navigate(`/editing/${record.id}`, { state: record });
  }, []);

  return (
    <div className="flex flex-col pt-3 border-0 border-b-[1px] border-[#ebebeb] border-solid last:border-0">
      <div className="flex justify-between text-[12px] text-[#969696] px-4 ">
        <div className="text-[13px]">{dayjs(data.time).format('YYYY年MM月DD日')}</div>
        <div className="flex space-x-3">
          {
            amountInfo.map(item => (
              <div key={item.type}>
                {item.name}
                :
                {' '}
                {item.amount}
              </div>
            ))
          }
        </div>
      </div>
      <div>
        {data.data.map((record, index) => (
          <RecordListItem
            onClick={onRecordItemClick(record)}
            index={index}
            lastIndex={data.data.length - 1}
            key={record.id}
            record={record}
          />
        ))}
      </div>
    </div>
  );
});

export default RecordList;
