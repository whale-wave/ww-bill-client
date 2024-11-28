import dayjs from 'dayjs';
import { useMemo } from 'react';
import type { AssetStatisticalRecord } from '@/api';

export function useAssetStatisticalRecord(data?: AssetStatisticalRecord[]) {
  const groupByMonth = useMemo(() => {
    if (!data)
      return [];
    const monthList = Array.from({ length: 12 }, (_, index) => index + 1);
    const result = monthList.map((month) => {
      const monthData = data.filter(item => dayjs(item.createdAt).month() + 1 === month);
      const amount = monthData.length === 0
        ? 0
        : monthData.toSorted((a, b) => {
          return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
        })[0].amount;
      return {
        month,
        amount,
      };
    });
    return result;
  }, [data]);

  return {
    groupByMonth,
  };
}
