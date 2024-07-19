import React, { useMemo } from 'react';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import dayjs from 'dayjs';
import { useGetRecordQuery } from '@/hooks';
import { useRecordStore } from '@/store';
import type { RecordEntry } from '@/api';
import RecordItemGroup from '@/pages/SearchRecord/components/RecordItemGroup.tsx';

interface RecordListProps {
}

const RecordList: React.FC<RecordListProps> = () => {
  const searchRecordKeyword = useRecordStore(({ searchRecordKeyword }) => searchRecordKeyword);

  const { data, isLoading } = useGetRecordQuery({
    params: {
      keyword: searchRecordKeyword,
    },
    options: {
      enabled: !!searchRecordKeyword,
    },
  });

  const recordGroupByDate = useMemo(() => {
    if (!data?.data.length)
      return [];

    const recordList = data.data.reverse();

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
            : (<div className="flex-grow overflow-auto pb-4 pt-[48px]">{recordGroupByDate.map(group => (<RecordItemGroup key={group.time} data={group} />))}</div>)}
    </>
  );
};

export default RecordList;
