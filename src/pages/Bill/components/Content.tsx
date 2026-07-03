import type { FC } from 'react';
import type { Bill } from '@/api';
import classNames from 'classnames';
import { memo, useCallback, useMemo } from 'react';
import { useBillPageStore } from '@/pages/Bill/store';
import { BillTabsType } from '@/pages/Bill/typs';
import { Icon } from '@/shared/ui';
import styles from './Content.module.scss';

type DataItem = {
  month: string;
} & Bill;

interface ContentProps {
  data: DataItem[];
}

const Content: FC<ContentProps> = memo(({ data }) => {
  const billTabType = useBillPageStore(({ billTabType }) => billTabType);
  const isMonthTabType = useMemo(() => billTabType === BillTabsType.MONTH, [billTabType]);

  const showData = useCallback((data: DataItem[]) => {
    if (data.length > 0)
      return data;
    return [{ month: `1${isMonthTabType ? '月' : '年'}`, income: 0, expand: 0, balance: 0 }];
  }, [isMonthTabType]);

  return (
    <div className={classNames(styles.wrapper, 'pb-4')}>
      <ul>
        <li className={styles.header}>
          <div>
            {isMonthTabType ? '月' : '年'}
            份
          </div>
          <div>
            {isMonthTabType ? '月' : '年'}
            收入
          </div>
          <div>
            {isMonthTabType ? '月' : '年'}
            支出
          </div>
          <div>
            {isMonthTabType ? '月' : '年'}
            结余
          </div>
          <div />
        </li>
        {showData(data).map(i => (
          <li key={i.month} className="font-bold">
            <div className="text-[14px] text-[#6C6C6C] flex-shrink-0">{i.month}</div>
            <div>
              <div>
                {i.income}
              </div>
            </div>
            <div>
              <div>
                {i.expand}
              </div>
            </div>
            <div>
              <div>
                {i.balance}
              </div>
            </div>
            <div style={{ opacity: isMonthTabType ? 1 : 0 }}>
              <Icon name="right" style={{ fontSize: 11 }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default Content;
