import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { FC } from 'react';
import type { AmountType, TimeRangeCategory } from '@/entities/chart';
import { Dropdown } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useChartHome } from '@/pages/chart/chart-home/model/chart-home-context';
import style from '@/pages/chart/chart-home/ui/Top.module.scss';
import { cn } from '@/shared/lib';
import { Icon, TabList } from '@/shared/ui';

export const Top: FC = () => {
  const { t } = useTranslation('chart');
  const { currentTimeRangeCategory, setCurrentTimeRangeCategory, currentAmountType, setCurrentAmountType } = useChartHome();

  const timeRangeCategoryList = useMemo(() => [
    {
      name: t('tabs.week'),
      value: 'week',
    },
    {
      name: t('tabs.month'),
      value: 'month',
    },
    {
      name: t('tabs.year'),
      value: 'year',
    },
  ] as { name: string; value: TimeRangeCategory }[], [t]);

  const amountTypeList = useMemo(() => [
    {
      name: t('amount.expend'),
      icon: 'huankuanzhichu-copy',
      value: 'sub',
    },
    {
      name: t('amount.income'),
      icon: 'jiekuanshouru-copy',
      value: 'add',
    },
  ] as { name: string; icon: string; value: AmountType }[], [t]);

  const currentAmountTypeItem = useMemo(() => amountTypeList.find(item => item.value === currentAmountType)!, [amountTypeList, currentAmountType]);

  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<DropdownRef>(null);

  const handleClickAmountType = useCallback((amountType: AmountType) => () => {
    setCurrentAmountType(amountType);
    ref.current?.close();
  }, [setCurrentAmountType]);

  return (
    <>
      <div className={cn(style['dropdown-wrapper'], 'bg-primary fixed top-0 left-0 right-0 z-10')} ref={dropdownWrapperRef}>
        <Dropdown
          ref={ref}
          closeOnClickAway
          className={cn('!bg-primary')}
          getContainer={dropdownWrapperRef.current}
        >
          <Dropdown.Item key="sorter" title={currentAmountTypeItem.name}>
            {amountTypeList.map((item, index) => (
              <div
                key={item.icon}
                className="flex items-center h-10 relative"
                data-chart-amount-type={item.value}
                onClick={handleClickAmountType(item.value)}
              >
                {index !== 0 && <div className="absolute right-0 top-0 w-[88%] h-[1px] bg-[#E5E5E5]" />}
                <div className="px-2">
                  <Icon className="text-2xl" name={item.icon} />
                </div>
                <span className="text-sm">{item.name}</span>
                {currentAmountTypeItem.value === item.value ? <CheckOutline className="text-xl absolute right-2" /> : null}
              </div>
            ))}
          </Dropdown.Item>
        </Dropdown>
      </div>
      <div className="px-2 pb-3 fixed top-[42.4px] w-full bg-primary">
        <TabList
          className="chart-period-tabs w-full"
          selectValue={currentTimeRangeCategory}
          tabs={timeRangeCategoryList}
          onChange={setCurrentTimeRangeCategory}
        />
      </div>
    </>
  );
};
