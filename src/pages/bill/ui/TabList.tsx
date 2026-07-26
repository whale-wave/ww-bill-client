import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import { TabList } from '@/shared/ui';

interface BillTabListProps {}

const BillTabList: React.FC<BillTabListProps> = memo(() => {
  const { t } = useTranslation('bill');
  const { billTabType, setBillTabTab } = useBillPageStore(({ billTabType, setBillTabTab }) => ({ billTabType, setBillTabTab }));

  const tabs = [
    {
      name: t('monthlyBill'),
      value: BillTabsType.MONTH,
    },
    {
      name: t('yearlyBill'),
      value: BillTabsType.YEAR,
    },
  ];

  const onChangeBillTabType = useCallback((billTabType: BillTabsType) => {
    setBillTabTab(billTabType);
  }, [setBillTabTab]);

  return (
    <TabList
      className="bill-period-tabs"
      selectValue={billTabType}
      tabs={tabs}
      onChange={onChangeBillTabType}
    />
  );
});

export default BillTabList;
