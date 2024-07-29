import type { RefObject } from 'react';
import React, { useContext, useMemo, useRef } from 'react';
import { Dropdown, List } from 'antd-mobile';
import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import { CheckOutline, DownFill } from 'antd-mobile-icons';
import { NavBar } from '@/components';
import style from '@/pages/Budget/components/BudgetTop.module.scss';
import { BudgetPageContext } from '@/pages/Budget/store/budgetPageContext.ts';
import { BudgetEntityType } from '@/api/budget.ts';

interface BudgetTopProps {
  dropDownWrapperRef: RefObject<HTMLDivElement>;
}

export const BudgetTop: React.FC<BudgetTopProps> = (props) => {
  const { dropDownWrapperRef } = props;

  const budgetPageContentValue = useContext(BudgetPageContext);
  const dropdownRef = useRef<DropdownRef>(null);

  const actions = useMemo(() => [
    {
      title: '月预算',
      key: BudgetEntityType.MONTH,
      onClick: () => {
        budgetPageContentValue?.setBudgetEntityType(BudgetEntityType.MONTH);

        dropdownRef.current?.close();
      },
    },
    {
      title: '年预算',
      key: BudgetEntityType.YEAR,
      onClick: () => {
        budgetPageContentValue?.setBudgetEntityType(BudgetEntityType.YEAR);

        dropdownRef.current?.close();
      },
    },
  ], []);

  return (
    <NavBar className={style['budget-navbar']}>
      <Dropdown ref={dropdownRef} className="" getContainer={dropDownWrapperRef.current} arrow={<DownFill className="text-black333 text-[15px]" />}>
        <Dropdown.Item key="month" title={budgetPageContentValue?.budgetEntityType === BudgetEntityType.MONTH ? '月预算' : '年预算'} className="">
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
