import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { ReactNode, RefObject } from 'react';
import { Dropdown, List } from 'antd-mobile';
import { CheckOutline, DownFill } from 'antd-mobile-icons';
import { useRef } from 'react';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
import { BudgetEntityType } from '../api';

export interface BudgetPeriodDropdownProps {
  budgetEntityType: BudgetEntityType;
  dropDownWrapperRef: RefObject<HTMLDivElement>;
  onBudgetEntityTypeChange: (budgetEntityType: BudgetEntityType) => void;
  onBack?: () => void;
  right?: ReactNode;
}

export const BudgetPeriodDropdown: React.FC<BudgetPeriodDropdownProps> = ({
  budgetEntityType,
  dropDownWrapperRef,
  onBudgetEntityTypeChange,
  onBack,
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
    <NavBar back={t('common:nav.back')} onBack={onBack} right={right}>
      <Dropdown
        arrow={<DownFill className="text-black333 text-base" />}
        className="bg-transparent [&_.adm-dropdown-item-highlight]:text-black333 [&_.adm-dropdown-item-title-arrow]:translate-y-0 [&_.adm-dropdown-item-title-arrow]:rotate-0 [&_.adm-dropdown-item-title-arrow]:[font-size:unset] [&_.adm-dropdown-item-title-text]:text-lg"
        getContainer={dropDownWrapperRef.current}
        ref={dropdownRef}
      >
        <Dropdown.Item
          key="budget-period"
          title={budgetEntityType === BudgetEntityType.MONTH
            ? t('dropdown.monthlyBudget')
            : t('dropdown.yearlyBudget')}
        >
          <List className="[&_.adm-list-item-content-main]:text-start">
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
