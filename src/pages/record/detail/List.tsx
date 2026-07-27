import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { recordChildren, RecordOverviewListGroup } from '@/entities/record';
import { PackageOpen } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordOverviewList } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { useRecordList } from '../model/useRecordList';
import styles from './list.module.scss';

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
  change: (amounts: AmountParts) => void;
  selectTime?: Dayjs;
}

const List: FC<ListProps> = memo(({ selectTime, change }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const { record } = useRecordList(selectTime, change);

  const handleRecord = useCallback((item: recordChildren) => {
    playSound.turnPage();
    navigate(`/editing/${item.id}`, { state: item });
  }, [navigate]);

  const groups = useMemo<RecordOverviewListGroup[]>(() => record.map((group: RecordGroup) => ({
    dateLabel: `${group[0]} ${group[1]}`,
    key: `${group[0]}-${group[1]}`,
    records: group[3].map(item => ({
      amount: item.type === 'add' ? item.amount : `-${item.amount}`,
      amountTone: item.type === 'add' ? 'income' : 'expense',
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
    <div className={styles.wrapper}>
      {groups.length > 0
        ? (
            <>
              <RecordOverviewList groups={groups} />
              <div className="h-[30px] flex-shrink-0"></div>
            </>
          )
        : (
            <div className={styles['not-data']}>
              <PackageOpen className="text-[#e0e0e0]" size={100} strokeWidth={1.5} />
              <span>{t('common:empty')}</span>
            </div>
          )}
    </div>
  );
});

export default List;
