import type { FC } from 'react';
import { useMemo, useRef } from 'react';
import classNames from 'classnames';
import { Dropdown } from 'antd-mobile';
import { Icon } from 'bw-mobile';
import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import style from '@/pages/Chart/ChartHome/components/top.module.scss';
import '@/components/tab-bar/tab-bar.scss';
import type { TimeRangeCategory } from '@/store';
import { useChartStore } from '@/store';
import { TabList } from '@/components';

const timeRangeCategoryList = [
  {
    name: '周',
    value: 'week',
  },
  {
    name: '月',
    value: 'month',
  },
  {
    name: '年',
    value: 'year',
  },
] as { name: string; value: TimeRangeCategory }[];

const amountTypeList = [
  {
    name: '支出',
    icon: 'huankuanzhichu-copy',
    value: 'sub',
  },
  {
    name: '收入',
    icon: 'jiekuanshouru-copy',
    value: 'add',
  },
] as { name: string; icon: string; value: 'sub' | 'add' }[];

export const Top: FC = () => {
  const currentTimeRangeCategory = useChartStore(state => state.currentTimeRangeCategory);
  const setCurrentTimeRangeCategory = useChartStore(state => state.setCurrentTimeRangeCategory);
  const currentAmountType = useChartStore(state => state.currentAmountType);
  const setCurrentAmountType = useChartStore(state => state.setCurrentAmountType);

  const currentAmountTypeItem = useMemo(() => amountTypeList.find(item => item.value === currentAmountType)!, [currentAmountType]);

  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<DropdownRef>(null);

  return (
    <div className={classNames(style.topContent, 'bg-primary')} ref={dropdownWrapperRef}>
      <div className={style.top}>
        <Dropdown
          ref={ref}
          closeOnClickAway={false}
          className={classNames(style.admDropdown)}
          getContainer={dropdownWrapperRef.current}
        >
          <Dropdown.Item
            key="sorter"
            title={currentAmountTypeItem.name}
            className={style.admDropdownItemActive}
          >
            <div
              className={classNames(style.downContent)}
              onClick={() => {
                ref.current?.close();
              }}
            >
              {amountTypeList.map(item => (
                <div
                  key={item.icon}
                  className={classNames(style.itemSelected)}
                  onClick={() => setCurrentAmountType(item.value)}
                >
                  <div>
                    <Icon name={item.icon} />
                  </div>
                  <div>
                    <span className={style.name}>{item.name}</span>
                    {currentAmountTypeItem?.value === item.value ? <Icon name="duigou-cu" /> : null}
                  </div>
                </div>
              ))}
            </div>
          </Dropdown.Item>
        </Dropdown>
        <div className="px-2 fixed top-[45px] w-full bg-primary z-10">
          <TabList
            className="w-full"
            selectValue={currentTimeRangeCategory}
            tabs={timeRangeCategoryList}
            onChange={setCurrentTimeRangeCategory}
          />
        </div>
      </div>
    </div>
  );
};
