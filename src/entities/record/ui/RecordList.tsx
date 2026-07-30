import type { RecordEntry } from '../types';
import dayjs from 'dayjs';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { math } from '@/shared/lib';
import { RecordOverviewList } from './RecordOverviewList';

interface RecordItemGroupProps {
  data: {
    time: number;
    data: RecordEntry[];
  };
  onRecordClick?: (record: RecordEntry) => void;
}

const RecordList: React.FC<RecordItemGroupProps> = memo((props) => {
  const { data, onRecordClick } = props;
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

  const handleRecordItemClick = useCallback((record: RecordEntry) => () => {
    if (onRecordClick) {
      onRecordClick(record);
      return;
    }
    navigate(`/editing/${record.id}`, { state: record });
  }, [navigate, onRecordClick]);

  return (
    <RecordOverviewList
      groups={[{
        dateLabel: dayjs(data.time).format('YYYY年MM月DD日'),
        key: String(data.time),
        records: data.data.map(record => ({
          amount: `${record.type === 'sub' ? '-' : ''}${record.amount}`,
          iconName: record.category.icon,
          id: record.id,
          onClick: handleRecordItemClick(record),
          primary: record.remark,
        })),
        summaries: amountInfo.map(item => ({
          key: item.type,
          label: item.name,
          value: item.amount,
        })),
      }]}
    />
  );
});

export default RecordList;
