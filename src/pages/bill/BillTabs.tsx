import type { FC } from 'react';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { memo, useCallback, useMemo } from 'react';
import { TabList } from '@/pages/bill/components';
import { useBillPageStore } from '@/pages/bill/store';
import { Icon } from '@/shared/ui';

export const BillTabs: FC = memo(() => {
  const selectDate = useBillPageStore(({ selectDate }) => selectDate);
  const setSelectDate = useBillPageStore(({ setSelectDate }) => setSelectDate);

  const { getIsMonthTabType } = useBillPageStore(({ getIsMonthTabType }) => ({ getIsMonthTabType }));

  const showYear = useMemo(() => {
    return dayjs(selectDate).format('YYYY年');
  }, [selectDate]);

  const onSelectYear = useCallback(() => {
    if (!getIsMonthTabType())
      return;

    void DatePicker.prompt({
      precision: 'year',
      defaultValue: selectDate,
      renderLabel: (_, v) => `${v}年`,
      onConfirm: setSelectDate,
    });
  }, [selectDate]);

  return (
    <div className="flex p-3 mb-2">
      <div
        className="w-[20%] flex items-center"
        style={{
          opacity: getIsMonthTabType() ? 1 : 0,
        }}
        onClick={onSelectYear}
      >
        {showYear}
        <Icon name="show-bottom" style={{ fontSize: 12, marginLeft: 4 }} />
      </div>
      <div className="flex flex-grow justify-center">
        <TabList />
      </div>
      <div className="w-[20%]" />
    </div>
  );
});
