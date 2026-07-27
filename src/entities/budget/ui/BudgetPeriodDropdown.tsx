import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { ReactNode, RefObject } from 'react';
import { Dropdown, List } from 'antd-mobile';
import { CheckOutline, DownFill } from 'antd-mobile-icons';
import { useRef } from 'react';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
import { BudgetEntityType } from '../api';
import style from './BudgetPeriodDropdown.module.scss';

export interface BudgetPeriodDropdownProps {
  budgetEntityType: BudgetEntityType;
  dropDownWrapperRef: RefObject<HTMLDivElement>;
  onBudgetEntityTypeChange: (budgetEntityType: BudgetEntityType) => void;
  right?: ReactNode;
}

export const BudgetPeriodDropdown: React.FC<BudgetPeriodDropdownProps> = ({
  budgetEntityType,
  dropDownWrapperRef,
  onBudgetEntityTypeChange,
  right,
}) => {
  const dropdownRef = useRef<DropdownRef>(null);
  const { t } = useTranslation('budget');
  const actions = [
    {
      title: t('dropdown.monthlyBudget'),
      key: BudgetEntityType.MONTH,
    },
    {
      title: t('dropdown.yearlyBudget'),
      key: BudgetEntityType.YEAR,
    },
  ];

  return (
    <NavBar right={right}>
      <Dropdown
        arrow={<DownFill className="text-black333 text-base" />}
        className={`${style.dropdown} bg-transparent`}
        getContainer={dropDownWrapperRef.current}
        ref={dropdownRef}
      >
        <Dropdown.Item
          key="budget-period"
          title={budgetEntityType === BudgetEntityType.MONTH
            ? t('dropdown.monthlyBudget')
            : t('dropdown.yearlyBudget')}
        >
          <List className={style.list}>
            {actions.map(item => (
              <List.Item
                arrow={budgetEntityType === item.key
                  ? <CheckOutline className="text-black333" />
                  : null}
                data-budget-type={item.key}
                key={item.title}
                onClick={() => {
                  onBudgetEntityTypeChange(item.key);
                  dropdownRef.current?.close();
                }}
              >
                {item.title}
              </List.Item>
            ))}
          </List>
        </Dropdown.Item>
      </Dropdown>
    </NavBar>
  );
};
