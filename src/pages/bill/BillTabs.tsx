import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker } from 'antd-mobile';
import { mergerProps } from '@/utils';
import { Icon } from 'bw-mobile';
import classNames from 'classnames';

enum Tabs {
  MONTH,
  YEAR,
}

const defaultProps = {};

export const BillTabs: FC<{
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
}> = (p) => {
  const { setDate, date } = mergerProps({ ...defaultProps }, p);
  const [select, setSelectTab] = useState<Tabs>(Tabs.MONTH);

  const tabs = [
    {
      name: '月账单',
      value: Tabs.MONTH,
    },
    {
      name: '年账单',
      value: Tabs.YEAR,
    },
  ];

  const showYear = useMemo(() => {
    return dayjs(date).format('YYYY年');
  }, [date]);

  const onSelectYear = () => {
    void DatePicker.prompt({
      precision: 'year',
      defaultValue: date,
      renderLabel: (t, v) => `${v}年`,
      onConfirm: setDate,
    });
  };

  return (
    <div className={'flex py-3 mb-2'}>
      <div className="w-[20%] flex items-center" onClick={onSelectYear}>
        {showYear}
        <Icon name="show-bottom" style={{ fontSize: 12, marginLeft: 4 }} />
      </div>
      <div className={'flex flex-grow justify-center'}>
        <div
          className={
            'border-[1px] border-solid border-[#333] inline-flex rounded-lg overflow-hidden'
          }
        >
          {tabs.map((tab) => (
            <div
              className={classNames('py-1 px-4', {
                'bg-[#333] text-[#fff]': select === tab.value,
              })}
              key={tab.value}
              onClick={() => setSelectTab(tab.value)}
            >
              {tab.name}
            </div>
          ))}
        </div>
      </div>
      <div className={'w-[20%]'} />
    </div>
  );
};
