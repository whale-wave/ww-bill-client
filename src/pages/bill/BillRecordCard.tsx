import type { FC } from 'react';
import type { Bill } from '@/entities/record';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { RecordMonthPicker } from '@/entities/record';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import { formatAmount } from '@/shared/lib';
import { GradientPanel, MetricGrid } from '@/shared/ui';

const defaultProps = {
  data: {
    income: 0,
    expand: 0,
    balance: 0,
  },
};

function renderAmount(value: number | undefined) {
  return formatAmount(value ?? 0);
}

export const BillRecordCard: FC<{ data?: Bill }> = ({ data = defaultProps.data }) => {
  const { t } = useTranslation('bill');
  const billTabType = useBillPageStore(({ billTabType }) => billTabType);
  const selectDate = useBillPageStore(({ selectDate }) => selectDate);
  const setSelectDate = useBillPageStore(({ setSelectDate }) => setSelectDate);
  const isMonth = billTabType === BillTabsType.MONTH;

  return (
    <GradientPanel className="mb-[14px] overflow-hidden px-[22px] py-5" elevation="high" surface="aurora">
      <div className="flex h-8 items-center justify-between">
        {isMonth
          ? (
              <RecordMonthPicker
                month={dayjs(selectDate)}
                onChange={value => setSelectDate(value.toDate())}
                precision="year"
                testId="bill-year-selector"
                variant="compact"
              />
            )
          : (
              <span
                aria-hidden="true"
                className="flex h-8 items-center rounded-full border border-transparent bg-white/30 px-3 text-[13px] font-bold text-ww-mid"
                data-testid="bill-year-selector"
              >
                {t('allTime')}
              </span>
            )}
        <span className="text-[11px] font-semibold tracking-[0.5px] text-ww-mid">
          {isMonth ? t('yearOverview') : t('allTimeOverview')}
        </span>
      </div>
      <div className="pb-[18px] pt-4">
        <div className="text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-mid">
          {isMonth ? t('year') : t('total')}
          {t('balance')}
        </div>
        <div className="mt-1 flex min-w-0 items-baseline font-number text-ww-ink">
          <span className="mr-1 text-[15px] font-extrabold text-ww-mid">¥</span>
          <span className="truncate text-[32px] font-black leading-[42px]">{renderAmount(data.balance)}</span>
        </div>
      </div>
      <MetricGrid
        align="start"
        className="border-t border-[rgba(100,160,200,0.18)] pt-[14px]"
        columns={2}
        density="standard"
        items={[
          { key: 'income', label: `${isMonth ? t('year') : t('total')}${t('income')}`, tone: 'income', value: `¥${renderAmount(data.income)}` },
          { key: 'expense', label: `${isMonth ? t('year') : t('total')}${t('expend')}`, tone: 'expense', value: `¥${renderAmount(data.expand)}` },
        ]}
      />
    </GradientPanel>
  );
};
