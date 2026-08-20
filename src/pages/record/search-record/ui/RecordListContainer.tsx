import type { RecordEntry } from '@/entities/record';
import { useDebounce } from 'ahooks';
import { ErrorBlock } from 'antd-mobile';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RecordList, useGetRecordQuery } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { PageLoadingState } from '@/shared/ui';

interface RecordListProps {
}

const RecordListContainer: React.FC<RecordListProps> = () => {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const searchRecordKeyword = searchParams.get('q') ?? '';
  const debounceSearchRecordKeyword = useDebounce(searchRecordKeyword, { wait: 250 });

  const { data, isLoading } = useGetRecordQuery({
    params: {
      keyword: debounceSearchRecordKeyword,
    },
    options: {
      enabled: !!debounceSearchRecordKeyword,
    },
  });

  const recordGroupByDate = useMemo(() => {
    if (!data?.data.length)
      return [];

    const recordList = cloneDeep(data.data);

    const result = [] as { time: number; data: RecordEntry[] }[];

    const timeGroupMap = new Map<number, RecordEntry[]>();

    recordList.forEach((record) => {
      const time = dayjs(record.time).startOf('day').valueOf();

      let timeGroup = timeGroupMap.get(time);

      if (!timeGroup) {
        timeGroup = [record];
        timeGroupMap.set(time, timeGroup);
        result.push({
          time,
          data: timeGroup,
        });
      }
      else {
        timeGroup.push(record);
      }
    });

    return result;
  }, [data]);

  const emptyEl = <div className="flex-grow flex justify-center items-center"><ErrorBlock status="empty" /></div>;

  return (
    <>
      {!searchRecordKeyword
        ? emptyEl
        : isLoading
          ? <PageLoadingState compact label={t('nav.loading')} testId="record-list-loading" />
          : recordGroupByDate.length === 0
            ? emptyEl
            : recordGroupByDate.map(group => (<RecordList key={group.time} data={group} />))}
    </>
  );
};

export default RecordListContainer;
