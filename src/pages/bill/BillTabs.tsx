import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { FC } from 'react';
import { Dropdown, List } from 'antd-mobile';
import { CheckOutline, DownFill } from 'antd-mobile-icons';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';

export const BillTabs: FC = memo(() => {
  const { t } = useTranslation('bill');
  const billTabType = useBillPageStore(({ billTabType }) => billTabType);
  const setBillTabTab = useBillPageStore(({ setBillTabTab }) => setBillTabTab);
  const dropdownRef = useRef<DropdownRef>(null);
  const options = useMemo(() => [
    { label: t('monthlyBill'), value: BillTabsType.MONTH },
    { label: t('yearlyBill'), value: BillTabsType.YEAR },
  ], [t]);
  const current = options.find(option => option.value === billTabType) ?? options[0]!;
  const handleChange = useCallback((value: BillTabsType) => {
    setBillTabTab(value);
    dropdownRef.current?.close();
  }, [setBillTabTab]);

  return (
    <Dropdown
      arrow={<DownFill className="text-sm text-black333" />}
      className="min-w-[96px]"
      closeOnClickAway
      ref={dropdownRef}
    >
      <Dropdown.Item key="bill-period" title={current.label}>
        <List>
          {options.map(option => (
            <List.Item
              arrow={option.value === billTabType ? <CheckOutline /> : null}
              key={option.value}
              onClick={() => handleChange(option.value)}
            >
              {option.label}
            </List.Item>
          ))}
        </List>
      </Dropdown.Item>
    </Dropdown>
  );
});
