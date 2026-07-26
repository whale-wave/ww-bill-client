import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { RefObject } from 'react';
import { Dropdown, List } from 'antd-mobile';
import { CheckOutline, DownFill } from 'antd-mobile-icons';
import React, { useContext, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BudgetEntityType } from '@/entities/budget';
import { BudgetPageContext } from '@/pages/budget/model/budgetPageContext.ts';
import style from '@/pages/budget/ui/BudgetTop.module.scss';
import { NavBar } from '@/shared/ui';

interface BudgetTopProps {
  dropDownWrapperRef: RefObject<HTMLDivElement>;
}

export const BudgetTop: React.FC<BudgetTopProps> = (props) => {
  const { t } = useTranslation('budget');
  const { dropDownWrapperRef } = props;
  const budgetPageContentValue = useContext(BudgetPageContext);
  const dropdownRef = useRef<DropdownRef>(null);
  const setBudgetEntityType = budgetPageContentValue?.setBudgetEntityType;

  const actions = useMemo(() => [
    {
      title: t('dropdown.monthlyBudget'),
      key: BudgetEntityType.MONTH,
      onClick: () => {
        setBudgetEntityType?.(BudgetEntityType.MONTH);

        dropdownRef.current?.close();
      },
    },
    {
      title: t('dropdown.yearlyBudget'),
      key: BudgetEntityType.YEAR,
      onClick: () => {
        setBudgetEntityType?.(BudgetEntityType.YEAR);

        dropdownRef.current?.close();
      },
    },
  ], [setBudgetEntityType, t]);

  return (
    <NavBar className={style['budget-navbar']}>
      <Dropdown
        arrow={<DownFill className="text-black333 text-base" />}
        getContainer={dropDownWrapperRef.current}
        ref={dropdownRef}
      >
        <Dropdown.Item
          key="budget-period"
          title={budgetPageContentValue?.budgetEntityType === BudgetEntityType.MONTH
            ? t('dropdown.monthlyBudget')
            : t('dropdown.yearlyBudget')}
        >
          <List>
            {actions.map(item => (
              <List.Item
                arrow={budgetPageContentValue?.budgetEntityType === item.key
                  ? <CheckOutline className="text-black333" />
                  : null}
                data-budget-type={item.key}
                key={item.title}
                onClick={item.onClick}
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
