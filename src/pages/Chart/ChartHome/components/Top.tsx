import type { FC } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { Dropdown } from 'antd-mobile';
import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import { CheckOutline } from 'antd-mobile-icons';
import style from '@/pages/Chart/ChartHome/components/Top.module.scss';
import type { AmountType, TimeRangeCategory } from '@/store';
import { useChartStore } from '@/store';
import { Icon, TabList } from '@/components';

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

  const handleClickAmountType = useCallback((amountType: AmountType) => () => {
    setCurrentAmountType(amountType);
    ref.current?.close();
  }, [setCurrentAmountType]);

  return (
    <>
      <div className={classNames(style['dropdown-wrapper'], 'bg-primary fixed top-0 left-0 right-0')} ref={dropdownWrapperRef}>
        <Dropdown
          ref={ref}
          closeOnClickAway
          className={classNames('!bg-primary')}
          getContainer={dropdownWrapperRef.current}
        >
          <Dropdown.Item
            key="sorter"
            title={currentAmountTypeItem.name}
          >
            {amountTypeList.map((item, index) => (
              <div
                key={item.icon}
                className="flex items-center h-10 relative"
                onClick={handleClickAmountType(item.value)}
              >
                {index !== 0 && <div className="absolute right-0 top-0 w-[88%] h-[1px] bg-[#E5E5E5]" />}
                <div className="px-2">
                  <Icon className="text-[28px]" name={item.icon} />
                </div>
                <span className="text-sm">{item.name}</span>
                {currentAmountTypeItem?.value === item.value ? <CheckOutline className="text-[20px] absolute right-2" /> : null}
              </div>
            ))}
          </Dropdown.Item>
        </Dropdown>
      </div>
      <div className="px-2 pb-3 fixed top-[42.4px] w-full bg-primary">
        <TabList
          className="w-full"
          selectValue={currentTimeRangeCategory}
          tabs={timeRangeCategoryList}
          onChange={setCurrentTimeRangeCategory}
        />
      </div>
    </>
  );
};
