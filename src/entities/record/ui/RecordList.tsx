import type { RecordEntry } from '../types';
import dayjs from 'dayjs';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { money } from '@/shared/lib';
import { RecordOverviewList } from './RecordOverviewList';
import { getRecordListIndicators } from './recordPresentationMappers';

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
        amount: '0',
      },
      {
        type: 'sub',
        name: t('type.expense'),
        amount: '0',
      },
    ];

    data.data.forEach((record) => {
      if (record.type === 'add')
        info[0].amount = money.add(info[0].amount, record.amount);
      else
        info[1].amount = money.add(info[1].amount, record.amount);
    });

    return info.filter(item => money.compare(item.amount, 0) > 0);
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
        records: data.data.map((record) => {
          const indicators = getRecordListIndicators(record);
          return {
            amount: `${record.type === 'sub' ? '-' : ''}${money.formatNatural(record.amount)}`,
            amountTone: record.type === 'add' ? 'income' : 'expense',
            categoryName: record.category.name,
            iconName: record.category.icon,
            id: record.id,
            onClick: handleRecordItemClick(record),
            originalAmount: record.originalAmount
              ? `-${money.formatNatural(record.originalAmount)}`
              : undefined,
            overviewSecondary: indicators.adjustmentSummary,
            primary: record.remark,
          };
        }),
        summaries: amountInfo.map(item => ({
          key: item.type,
          label: item.name,
          value: money.formatNatural(item.amount),
        })),
      }]}
    />
  );
});

export default RecordList;
