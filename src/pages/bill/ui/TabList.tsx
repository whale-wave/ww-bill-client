import React, { memo, useCallback } from 'react';
import { useBillPageStore } from '@/pages/bill/store';
import { BillTabsType } from '@/pages/bill/typs';
import { TabList } from '@/shared/ui';

interface BillTabListProps {}

const BillTabList: React.FC<BillTabListProps> = memo(() => {
  const { billTabType, setBillTabTab } = useBillPageStore(({ billTabType, setBillTabTab }) => ({ billTabType, setBillTabTab }));

  const tabs = [
    {
      name: '月账单',
      value: BillTabsType.MONTH,
    },
    {
      name: '年账单',
      value: BillTabsType.YEAR,
    },
  ];

  const onChangeBillTabType = useCallback((billTabType: BillTabsType) => {
    setBillTabTab(billTabType);
  }, []);

  return (
    <TabList
      selectValue={billTabType}
      tabs={tabs}
      onChange={onChangeBillTabType}
    />
  );
});

export default BillTabList;
