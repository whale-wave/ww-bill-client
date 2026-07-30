import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { FC } from 'react';
import type { ChartOverviewMetricOption } from '../model/chart-overview-context';
import type { TimeRangeCategory } from '@/entities/chart';
import { Dropdown } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, TabList } from '@/shared/ui';
import { useChartOverview } from '../model/chart-overview-context';

export const Top: FC = () => {
  const { t } = useTranslation('chart');
  const {
    currentAmountType,
    currentMetric = currentAmountType,
    currentTimeRangeCategory,
    metricOptions,
    onMetricChange,
    setCurrentAmountType,
    setCurrentTimeRangeCategory,
  } = useChartOverview();

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

  const amountTypeList = useMemo<ChartOverviewMetricOption[]>(() => metricOptions ?? [
    {
      label: t('amount.expend'),
      icon: 'huankuanzhichu-copy',
      value: 'sub',
    },
    {
      label: t('amount.income'),
      icon: 'jiekuanshouru-copy',
      value: 'add',
    },
  ], [metricOptions, t]);

  const currentAmountTypeItem = useMemo(
    () => amountTypeList.find(item => item.value === currentMetric) ?? amountTypeList[0],
    [amountTypeList, currentMetric],
  );

  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<DropdownRef>(null);

  const handleClickAmountType = useCallback((metric: ChartOverviewMetricOption['value']) => () => {
    if (onMetricChange)
      onMetricChange(metric);
    else if (metric !== 'net')
      setCurrentAmountType(metric);
    ref.current?.close();
  }, [onMetricChange, setCurrentAmountType]);

  return (
    <>
      <div
        className="fixed left-0 right-0 top-0 z-10 bg-primary [&_.adm-dropdown_.adm-dropdown-nav]:border-b-0 [&_.adm-dropdown-item-highlight]:text-[#333] [&_.adm-dropdown-item-title-arrow]:text-base [&_.adm-dropdown-item-title-arrow]:text-[#333] [&_.adm-dropdown-item-title-text]:text-base [&_.adm-popup.adm-dropdown-popup]:!top-[85.34px]"
        ref={dropdownWrapperRef}
      >
        <Dropdown
          ref={ref}
          closeOnClickAway
          className="!bg-primary"
          getContainer={dropdownWrapperRef.current}
        >
          <Dropdown.Item key="sorter" title={currentAmountTypeItem.label}>
            {amountTypeList.map((item, index) => (
              <div
                key={item.value}
                className="flex items-center h-10 relative"
                data-chart-amount-type={item.value}
                onClick={handleClickAmountType(item.value)}
              >
                {index !== 0 && <div className="absolute right-0 top-0 w-[88%] h-[1px] bg-[#E5E5E5]" />}
                <div className="px-2">
                  <Icon className="text-2xl" name={item.icon} />
                </div>
                <span className="text-sm">{item.label}</span>
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
