import { useTranslation } from '@/shared/i18n';
import type { RecordEntry } from '../types';
import dayjs from 'dayjs';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { math } from '@/shared/lib';
import RecordListItem from './RecordListItem';

interface RecordItemGroupProps {
  data: {
    time: number;
    data: RecordEntry[];
  };
}

const RecordList: React.FC<RecordItemGroupProps> = memo((props) => {
  const { data } = props;
  const { t } = useTranslation('record');
  const navigate = useNavigate();

  const amountInfo = useMemo(() => {
    const info = [
      {
        type: 'add',
        name: t('type.income'),
        amount: 0,
      },
      {
        type: 'sub',
        name: t('type.expense'),
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
  }, [data, t]);

  const onRecordItemClick = useCallback((record: RecordEntry) => () => {
    navigate(`/editing/${record.id}`, { state: record });
  }, [navigate]);

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
