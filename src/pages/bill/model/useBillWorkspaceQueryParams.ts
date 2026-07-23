import type { GetRecordBillApiParams } from '@/entities/record';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useBillPageStore } from './billPage';

export function useBillWorkspaceQueryParams(): GetRecordBillApiParams {
  const selectDate = useBillPageStore(({ selectDate }) => selectDate);
  const isMonth = useBillPageStore(({ getIsMonthTabType }) => getIsMonthTabType());

  return useMemo(() => isMonth
    ? { type: 'year' as const, year: dayjs(selectDate).year() }
    : { type: 'all' as const }, [isMonth, selectDate]);
}
