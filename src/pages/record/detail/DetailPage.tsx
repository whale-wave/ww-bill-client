import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { recordChildren, RecordOverviewListGroup } from '@/entities/record';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { RecordOverviewPresentation } from '@/entities/record';
import { useRecordOverviewHeader } from '@/pages/record/detail/Top';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { TabBar } from '@/widgets/layout';
import { useRecordList } from '../model/useRecordList';

export type numType = [Array<string>, Array<string>];

const Detail: FC = () => {
  const [selectTime, setSelectTime] = useState<Dayjs>(() => {
    const stored = sessionStorage.getItem('timeDate');
    return stored ? dayjs(stored) : dayjs();
  });
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const query = useRecordList(selectTime);
  const header = useRecordOverviewHeader({
    numExpendIncome: query.amounts,
    selectTime,
    setSelectTime,
  });

  const handleRecord = useCallback((item: recordChildren) => {
    playSound.turnPage();
    navigate(`/editing/${item.id}`, { state: item });
  }, [navigate]);

  const groups = useMemo<RecordOverviewListGroup[]>(() => query.record.map(group => ({
    dateLabel: `${group[0]} ${group[1]}`,
    key: `${group[0]}-${group[1]}`,
    records: group[3].map(item => ({
      amount: item.type === 'add' ? item.amount : -Number(item.amount),
      amountTone: item.type === 'add' ? 'income' : 'expense',
      categoryName: item.category.name,
      iconName: item.category.icon,
      id: item.id,
      onClick: () => handleRecord(item),
      primary: item.remark,
    })),
    summaries: [
      ...(group[5] > 0
        ? [{ key: 'income', label: t('common:amount.income'), value: group[5] }]
        : []),
      { key: 'expense', label: t('common:amount.expend'), value: group[4] },
    ],
  })), [handleRecord, query.record, t]);

  return (
    <div className="page">
      <RecordOverviewPresentation
        emptyDescription={t('common:empty')}
        errorDescription={t('common:api.error')}
        groups={groups}
        header={header}
        onRetry={() => void query.refetch()}
        retryLabel={t('common:button.retry')}
        renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
        state={query.isLoading ? 'loading' : query.isError ? 'error' : 'ready'}
      />
      <TabBar active={0} />
    </div>
  );
};

export default Detail;
