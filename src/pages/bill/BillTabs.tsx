import type { FC } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';

export const BillTabs: FC = memo(() => {
  const { t } = useTranslation('bill');
  const billTabType = useBillPageStore(({ billTabType }) => billTabType);
  const setBillTabTab = useBillPageStore(({ setBillTabTab }) => setBillTabTab);
  const tabs = useMemo(() => [
    { label: t('monthlyBill'), value: BillTabsType.MONTH },
    { label: t('yearlyBill'), value: BillTabsType.YEAR },
  ], [t]);
  const handleChange = useCallback((value: BillTabsType) => {
    setBillTabTab(value);
  }, [setBillTabTab]);

  return (
    <div className="shrink-0 px-[18px] pb-[14px]">
      <div
        aria-label={t('periodSelector')}
        className="bill-period-tabs grid h-11 grid-cols-2 gap-1 rounded-[14px] border border-border-primary bg-white/70 p-1 shadow-ww-xs backdrop-blur-xl"
        role="tablist"
      >
        {tabs.map(tab => (
          <button
            aria-selected={billTabType === tab.value}
            className={billTabType === tab.value
              ? 'rounded-[11px] border-0 bg-white px-3 text-[14px] font-bold text-primary-deep shadow-ww-xs'
              : 'rounded-[11px] border-0 bg-transparent px-3 text-[14px] font-semibold text-ww-mid'}
            data-active={billTabType === tab.value ? '' : undefined}
            key={tab.value}
            onClick={() => handleChange(tab.value)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
});
