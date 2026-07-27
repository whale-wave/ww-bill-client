import type { RecordEntry } from '../types';
import dayjs from 'dayjs';
import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { math } from '@/shared/lib';
import { RecordOverviewList } from './RecordOverviewList';

interface RecordItemGroupProps {
  data: {
    data: RecordEntry[];
    time: number;
  };
}

const RecordList = memo(({ data }: RecordItemGroupProps) => {
  const { t } = useTranslation('record');
  const navigate = useNavigate();

  const handleRecordItemClick = useCallback((record: RecordEntry) => {
    navigate(`/editing/${record.id}`, { state: record });
  }, [navigate]);

  const groups = useMemo(() => {
    let income = 0;
    let expense = 0;
    data.data.forEach((record) => {
      if (record.type === 'add')
        income = math.add(income, record.amount).toNumber();
      else
        expense = math.add(expense, record.amount).toNumber();
    });

    return [{
      dateLabel: dayjs(data.time).format('YYYY年MM月DD日'),
      dateTime: dayjs(data.time).format('YYYY-MM-DD'),
      key: String(data.time),
      records: data.data.map(record => ({
        amount: `${record.type === 'sub' ? '-' : ''}${record.amount}`,
        amountTone: record.type === 'add' ? 'income' as const : 'expense' as const,
        iconName: record.category.icon,
        id: record.id,
        onClick: () => handleRecordItemClick(record),
        primary: record.remark,
      })),
      summaries: [
        ...(income
          ? [{ key: 'income', label: t('type.income'), value: income }]
          : []),
        ...(expense
          ? [{ key: 'expense', label: t('type.expense'), value: expense }]
          : []),
      ],
    }];
  }, [data, handleRecordItemClick, t]);

  return <RecordOverviewList groups={groups} />;
});

export default RecordList;
