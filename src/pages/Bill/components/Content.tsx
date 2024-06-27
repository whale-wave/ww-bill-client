import { Icon } from 'bw-mobile';
import classNames from 'classnames';
import type { FC } from 'react';
import { memo, useCallback, useMemo } from 'react';
import styles from './Content.module.scss';
import { spliceNumberByPoint } from '@/utils/time';
import type { Bill } from '@/api';
import { BillTabsType } from '@/pages/Bill/typs';
import { useBillPageStore } from '@/pages/Bill/store';

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
    <div className={classNames(styles.wrapper, 'flex-grow overflow-auto')}>
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
          <li key={i.month}>
            <div className={styles.month}>{i.month}</div>
            <div>
              <div>
                {spliceNumberByPoint(i.income)[0]}
                .
                <span>{spliceNumberByPoint(i.income)[1]}</span>
              </div>
            </div>
            <div>
              <div>
                {spliceNumberByPoint(i.expand)[0]}
                .
                <span>{spliceNumberByPoint(i.expand)[1]}</span>
              </div>
            </div>
            <div>
              <div>
                {spliceNumberByPoint(i.balance)[0]}
                .
                <span>{spliceNumberByPoint(i.balance)[1]}</span>
              </div>
            </div>
            <div>
              <Icon name="right" style={{ fontSize: 11 }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default Content;
