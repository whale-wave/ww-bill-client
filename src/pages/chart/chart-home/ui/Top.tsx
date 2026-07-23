import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { FC } from 'react';
import type { AmountType, TimeRangeCategory } from '@/entities/chart';
import { CapsuleTabs, Dropdown, List } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LedgerSwitcherHeader } from '@/features/ledger-switcher';
import { useChartHome } from '@/pages/chart/chart-home/model/chart-home-context';
import style from '@/pages/chart/chart-home/ui/Top.module.scss';

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
      value: 'sub',
    },
    {
      name: t('amount.income'),
      value: 'add',
    },
  ] as { name: string; value: AmountType }[], [t]);

  const currentAmountTypeItem = amountTypeList.find(item => item.value === currentAmountType)!;

  const ref = useRef<DropdownRef>(null);

  const handleClickAmountType = useCallback((amountType: AmountType) => () => {
    setCurrentAmountType(amountType);
    ref.current?.close();
  }, [setCurrentAmountType]);

  return (
    <>
      <LedgerSwitcherHeader
        titleContent={(
          <Dropdown className={style['dropdown-wrapper']} closeOnClickAway ref={ref}>
            <Dropdown.Item key="amount-type" title={currentAmountTypeItem.name}>
              <List>
                {amountTypeList.map(item => (
                  <List.Item
                    arrow={currentAmountTypeItem.value === item.value
                      ? <CheckOutline />
                      : null}
                    key={item.value}
                    onClick={handleClickAmountType(item.value)}
                  >
                    {item.name}
                  </List.Item>
                ))}
              </List>
            </Dropdown.Item>
          </Dropdown>
        )}
      />
      <div className={style['period-tabs']}>
        <CapsuleTabs
          activeKey={currentTimeRangeCategory}
          onChange={key => setCurrentTimeRangeCategory(key as TimeRangeCategory)}
        >
          {timeRangeCategoryList.map(item => (
            <CapsuleTabs.Tab key={item.value} title={item.name} />
          ))}
        </CapsuleTabs>
      </div>
    </>
  );
};
