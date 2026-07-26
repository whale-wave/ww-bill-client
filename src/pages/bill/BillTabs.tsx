import type { FC } from 'react';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import { TabList } from '@/pages/bill/ui';
import { Icon } from '@/shared/ui';

export const BillTabs: FC = memo(() => {
  const { t } = useTranslation('bill');
  const selectDate = useBillPageStore(({ selectDate }) => selectDate);
  const setSelectDate = useBillPageStore(({ setSelectDate }) => setSelectDate);
  const isMonth = useBillPageStore(({ billTabType }) => billTabType === BillTabsType.MONTH);
  const showYear = useMemo(
    () => dayjs(selectDate).format(`YYYY${t('year')}`),
    [selectDate, t],
  );

  const handleSelectYear = useCallback(() => {
    if (!isMonth)
      return;

    void DatePicker.prompt({
      defaultValue: selectDate,
      onConfirm: setSelectDate,
      precision: 'year',
      renderLabel: (_, value) => `${value}${t('year')}`,
    });
  }, [isMonth, selectDate, setSelectDate, t]);

  return (
    <div className="mb-2 flex p-3">
      <button
        className="flex w-[20%] items-center border-0 bg-transparent p-0"
        data-testid="bill-year-selector"
        onClick={handleSelectYear}
        style={{ opacity: isMonth ? 1 : 0 }}
        type="button"
      >
        {showYear}
        <Icon name="show-bottom" style={{ fontSize: 12, marginLeft: 4 }} />
      </button>
      <div className="flex flex-grow justify-center">
        <TabList />
      </div>
      <div className="w-[20%]" />
    </div>
  );
});
