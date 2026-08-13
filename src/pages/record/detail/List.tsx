import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { recordChildren, RecordOverviewListGroup } from '@/entities/record';
import { Plus } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import { RecordOverviewList } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { DesignIcon, IllustratedEmptyState } from '@/shared/ui';
import { useRecordList } from '../model/useRecordList';

type RecordGroup = [
  string,
  string,
  number,
  recordChildren[],
  number,
  number,
];

type AmountParts = [string[], string[]];

interface ListProps {
  change?: (amounts: AmountParts) => void;
  selectTime?: Dayjs;
}

const List: FC<ListProps> = memo(({ selectTime, change }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const { amounts, record } = useRecordList(selectTime);

  useEffect(() => {
    change?.(amounts);
  }, [amounts, change]);

  const handleRecord = useCallback((item: recordChildren) => {
    playSound.turnPage();
    navigate(`/editing/${item.id}`, { state: item });
  }, [navigate]);

  const groups = useMemo<RecordOverviewListGroup[]>(() => record.map((group: RecordGroup) => ({
    dateLabel: `${group[0]} ${group[1]}`,
    key: `${group[0]}-${group[1]}`,
    records: group[3].map(item => ({
      amount: item.type === 'add' ? item.amount : -item.amount,
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
  })), [handleRecord, record, t]);

  return (
    <div className="mt-[9px] flex min-h-0 flex-grow flex-col overflow-auto">
      {groups.length > 0
        ? (
            <>
              <RecordOverviewList
                groups={groups}
                renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
                variant="overview"
              />
              <div className="h-[30px] flex-shrink-0"></div>
            </>
          )
        : (
            <IllustratedEmptyState
              accentIcon={<Plus size={19} strokeWidth={2.2} />}
              actionLabel={t('detail.emptyAction')}
              className="min-h-[330px] flex-grow"
              description={t('detail.emptyDescription')}
              icon={<DesignIcon name="tab-detail-active" size={46} />}
              onAction={() => navigate('/bookkeeping')}
              testId="record-list-empty-state"
              title={t('detail.emptyTitle')}
            />
          )}
    </div>
  );
});

export default List;
