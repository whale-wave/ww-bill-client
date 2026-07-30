import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { recordChildren, RecordOverviewListGroup } from '@/entities/record';
import { PackageOpen } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordOverviewList } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
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
              <RecordOverviewList groups={groups} variant="overview" />
              <div className="h-[30px] flex-shrink-0"></div>
            </>
          )
        : (
            <div className="flex flex-grow flex-col items-center justify-center text-base text-[#e0e0e0]">
              <PackageOpen className="text-[#e0e0e0]" size={100} strokeWidth={1.5} />
              <span>{t('common:empty')}</span>
            </div>
          )}
    </div>
  );
});

export default List;
