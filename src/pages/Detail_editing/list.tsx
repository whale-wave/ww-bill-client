import type { FC } from 'react';
import type { recordChildren } from '../detail/List';
import c from 'classnames';
import { useEffect, useState } from 'react';
import { FixedPin } from '@/components/ui/index.ts';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/utils/DataTime';
import styles from './list.module.scss';

interface stateType {
  state: recordChildren;
}

const List: FC<stateType> = ({ state }) => {
  const list = { 类型: '', 金额: '', 日期: '', 备注: '' };
  const [listKeys, setListKeys] = useState([
    'type',
    'amount',
    'time',
    'remark',
  ]);

  const createFn = () => {
    const { amount, remark } = state;
    let { type, time } = state;
    switch (type) {
      case 'sub':
        type = '支出';
        break;
      case 'add':
        type = '收入';
        break;
    }
    const date1 = new Date(time);
    const timeDate = getTimeDateYear(date1);
    const timeDate1 = getTimedate(date1);
    const weekByDay = getWeekByDay(timeDate1);
    time = `${timeDate}  ${weekByDay}`;

    const list = [type, amount, time, remark];
    setListKeys(list);
  };

  useEffect(() => {
    createFn();
  }, []);

  return (
    <div className={styles.list}>
      {Object.keys(list).map((item, index) => (
        <div className={c(styles.listItem, 'py-[20px] px-[15px]')} key={index}>
          <span className="flex-shrink-0">{item}</span>
          <span className={c(styles.listKeys, 'ml-[12px]')}>
            {listKeys[index]}
          </span>
        </div>
      ))}
      <FixedPin>分享</FixedPin>
    </div>
  );
};

export default List;
