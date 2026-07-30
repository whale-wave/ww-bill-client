import type { RecordEntry } from '@/entities/record';
import { useDebounce } from 'ahooks';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RecordList, useGetRecordQuery } from '@/entities/record';

interface RecordListProps {
}

const RecordListContainer: React.FC<RecordListProps> = () => {
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
          ? <div className="flex-grow flex justify-center items-center"><SpinLoading /></div>
          : recordGroupByDate.length === 0
            ? emptyEl
            : recordGroupByDate.map(group => (<RecordList key={group.time} data={group} />))}
    </>
  );
};

export default RecordListContainer;
