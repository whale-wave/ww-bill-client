import dayjs from 'dayjs';
import { useMemo } from 'react';
import type { AssetStatisticalRecord } from '@/api';
import { math } from '@/utils';

export function useAssetStatisticalRecord(data?: AssetStatisticalRecord[]) {
  const groupByMonth = useMemo(() => {
    if (!data)
      return [];
    const monthList = Array.from({ length: 12 }, (_, index) => index + 1);
    const result = monthList.map((month) => {
      const monthData = data.filter(item => dayjs(item.createdAt).month() + 1 === month);
      return {
        month,
        amount: monthData.reduce((acc, cur) => math.add(acc, cur.amount).toNumber(), 0),
      };
    });
    return result;
  }, [data]);

  return {
    groupByMonth,
  };
}
