import type { Dayjs } from 'dayjs';
import type { recordChildren } from '@/entities/record';
import { useMemo } from 'react';
import { useGetRecordQuery } from '@/entities/record';
import { math } from '@/shared/lib';
import { getTimeValueFn, getWeekByDay } from '@/shared/lib/date-time';

type recordType = [
  string,
  string,
  number,
  Array<recordChildren>,
  number,
  number,
];

export type PersonalRecordAmounts = [Array<string>, Array<string>];

function toAmountParts(value: number) {
  const [integer, decimal = ''] = String(value).split('.');
  return [integer, decimal];
}

export function useRecordList(selectTime: Dayjs | undefined) {
  const query = useGetRecordQuery({
    params: { startDate: selectTime?.format('YYYY-MM-DD') },
    options: {
      enabled: !!selectTime,
    },
  });

  const record = useMemo(() => {
    const lists = query.data.data;
    const record: Array<recordType> = [];
    const recordHash: {
      [string: string]: [
        string,
        string,
        number,
        recordChildren[],
        number,
        number,
      ];
    } = {};
    lists.forEach((item) => {
      const time2 = new Date(item.time).getTime(); // 这条数据添加进去时候的时间
      // 时间戳转换为普通时间
      const time = new Date(Number.parseInt(String(time2)))
        .toLocaleString()
        .replace(/:\d{1,2}$/, ' ');
      // 创建的时间传递过去  返回改天为星期几
      const Week = getWeekByDay(time);

      // 创建这个数据的时间
      const data = new Date(item.time);
      const createdTime = getTimeValueFn(data);

      if (createdTime in recordHash) {
        recordHash[createdTime][3].push({ ...item });
      }
      else {
        recordHash[createdTime] = [
          createdTime,
          Week,
          time2,
          [{ ...item }],
        ] as unknown as recordType;
      }
    });

    const itemRecord = Object.keys(recordHash);
    itemRecord.forEach((item) => {
      record.push(recordHash[item]);
    });
    let max;
    for (let i = 0; i < record.length; i++) {
      // 外层循环一次，就拿record[i] 和 内层循环record.legend次的 record[j] 做对比
      for (let j = i; j < record.length; j++) {
        if (record[i][2] < record[j][2]) {
          max = record[j];
          record[j] = record[i];
          record[i] = max;
        }
      }
    }

    record.forEach((item) => {
      let addAmount = 0;
      let reduceAmount = 0;
      item[3].forEach((chunk) => {
        if (chunk.type === 'sub') {
          reduceAmount = math.add(chunk.amount, reduceAmount).toNumber();
        }
        else if (chunk.type === 'add') {
          addAmount = math.add(chunk.amount, addAmount).toNumber();
        }
      });
      item.push(reduceAmount, addAmount);
    });

    return record;
  }, [query.data.data]);

  const amounts = useMemo<PersonalRecordAmounts>(() => [
    toAmountParts(query.data.expend),
    toAmountParts(query.data.income),
  ], [query.data.expend, query.data.income]);

  return {
    amounts,
    hasData: Boolean(query.response),
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    record,
    refetch: query.refetch,
  };
}
