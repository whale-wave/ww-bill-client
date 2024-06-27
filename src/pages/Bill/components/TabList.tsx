import React, { memo, useCallback } from 'react';
import classNames from 'classnames';
import { BillTabsType } from '@/pages/Bill/typs';
import { useBillPageStore } from '@/pages/Bill/store';

interface TabList {}

const TabLIst: React.FC<TabList> = memo(() => {
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

  const onChangeBillTabType = useCallback((billTabType: BillTabsType) => () => {
    setBillTabTab(billTabType);
  }, []);

  return (
    <div
      className="border-[1px] border-solid border-[#333] inline-flex rounded-lg overflow-hidden"
    >
      {tabs.map(tab => (
        <div
          className={classNames('py-[5px] px-4', {
            'bg-[#333] text-[#fff]': billTabType === tab.value,
          })}
          key={tab.value}
          onClick={onChangeBillTabType(tab.value)}
        >
          {tab.name}
        </div>
      ))}
    </div>
  )
  ;
});

export default TabLIst;
