import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import { PackageOpen } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordList } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { useRecordList } from '../model/useRecordList';
import styles from './list.module.scss';

type recordType = [
  string,
  string,
  number,
  Array<recordChildren>,
  number,
  number,
];

type numType = [Array<string>, Array<string>];

interface timeDateProp {
  selectTime?: Dayjs;
  change: (arr: numType) => void;
}

const List: FC<timeDateProp> = memo(({ selectTime, change }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const { record } = useRecordList(selectTime, change);

  const handleRecord = (record: recordChildren) => {
    playSound.turnPage();
    navigate(`/editing/${record.id}`, { state: record });
  };

  return (
    <div className={styles.wrapper}>
      {record.length
        ? (
            <>
              {record.map((item: recordType) => (
                <RecordList
                  data={{ data: item[3], time: item[2] }}
                  dateLabel={`${item[0]} ${item[1]}`}
                  key={`${item[0]}-${item[1]}`}
                  onRecordClick={handleRecord}
                />
              ))}
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
