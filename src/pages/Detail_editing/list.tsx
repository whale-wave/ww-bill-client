import type { FC } from 'react';
import type { recordChildren } from '../detail/List';
import c from 'classnames';
import { useMemo } from 'react';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/shared/lib/date-time';
import { FixedPin } from '@/shared/ui';
import styles from './list.module.scss';

interface stateType {
  state: recordChildren;
}

const List: FC<stateType> = ({ state }) => {
  const displayItems = useMemo(() => {
    const typeMap: Record<string, string> = {
      sub: '支出',
      add: '收入',
    };

    const date = new Date(state.time);
    const timeDate = getTimeDateYear(date);
    const timeDate1 = getTimedate(date);
    const weekByDay = getWeekByDay(timeDate1);

    return [
      { label: '类型', value: typeMap[state.type] || state.type },
      { label: '金额', value: state.amount },
      { label: '日期', value: `${timeDate}  ${weekByDay}` },
      { label: '备注', value: state.remark },
    ];
  }, [state]);

  return (
    <div className={styles.list}>
      {displayItems.map(item => (
        <div className={c(styles.listItem, 'py-[20px] px-[15px]')} key={item.label}>
          <span className="flex-shrink-0">{item.label}</span>
          <span className={c(styles.listKeys, 'ml-[12px]')}>
            {item.value}
          </span>
        </div>
      ))}
      <FixedPin>分享</FixedPin>
    </div>
  );
};

export default List;
