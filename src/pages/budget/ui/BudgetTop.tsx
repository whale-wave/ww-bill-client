import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import type { RefObject } from 'react';
import { Dropdown, List } from 'antd-mobile';
import { CheckOutline, DownFill } from 'antd-mobile-icons';
import React, { useContext, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const budgetPageContentValue = useContext(BudgetPageContext);
  const dropdownRef = useRef<DropdownRef>(null);

  const actions = useMemo(() => [
    {
      title: t('dropdown.monthlyBudget'),
      key: BudgetEntityType.MONTH,
      onClick: () => {
        budgetPageContentValue?.setBudgetEntityType(BudgetEntityType.MONTH);

        dropdownRef.current?.close();
      },
    },
    {
      title: t('dropdown.yearlyBudget'),
      key: BudgetEntityType.YEAR,
      onClick: () => {
        budgetPageContentValue?.setBudgetEntityType(BudgetEntityType.YEAR);

        dropdownRef.current?.close();
      },
    },
  ], [t]);

  return (
    <NavBar className={style['budget-navbar']} onBack={() => navigate(-1)}>
      <Dropdown ref={dropdownRef} className="" getContainer={dropDownWrapperRef.current} arrow={<DownFill className="text-black333 text-base" />}>
        <Dropdown.Item key="month" title={budgetPageContentValue?.budgetEntityType === BudgetEntityType.MONTH ? t('dropdown.monthlyBudget') : t('dropdown.yearlyBudget')} className="">
          <List>
            {
              actions.map(item => (
                <List.Item
                  key={item.title}
                  onClick={item.onClick}
                  arrow={budgetPageContentValue?.budgetEntityType === item.key ? <CheckOutline className="text-black333" /> : null}
                >
                  {item.title}
                </List.Item>
              ))
            }
          </List>
        </Dropdown.Item>
      </Dropdown>
    </NavBar>
  );
};
