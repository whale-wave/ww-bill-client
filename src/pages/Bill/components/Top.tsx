import type { FC } from 'react';
import type { Bill } from '@/api';
import { DatePicker } from 'antd-mobile';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { mergerProps } from '@/shared/lib';
import { spliceNumberByPoint } from '@/shared/lib/time';
import { Icon } from '@/shared/ui';
import styles from './Top.module.scss';

interface TopProps {
  data?: Bill;
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

const defaultProps = {
  data: {
    income: 0,
    expand: 0,
    balance: 0,
  },
};

const Top: FC<TopProps> = (p) => {
  const { data, setDate, date } = mergerProps({ ...defaultProps }, p);

  const onSelectYear = () => {
    DatePicker.prompt({
      precision: 'year',
      defaultValue: date,
      renderLabel: (_, v) => `${v}年`,
      onConfirm: setDate,
    });
  };

  const showYear = useCallback(() => {
    return dayjs(date).format('YYYY年');
  }, [date]);

  return (
    <div className={classNames(styles.wrapper, 'flex flex-col flex-shrink-0')}>
      <div
        className={classNames(styles.top, 'flex items-center flex-shrink-0')}
      >
        <span>
          <div className="flex items-center" onClick={onSelectYear}>
            {showYear()}
            <Icon name="show-bottom" style={{ fontSize: 12, marginLeft: 4 }} />
          </div>
        </span>
        <div>账单</div>
        <span />
      </div>
      <div
        className={classNames(
          styles.total,
          'flex flex-col justify-around items-center flex-grow',
        )}
      >
        <span>结余</span>
        <div>
          {spliceNumberByPoint(data.balance)[0]}
          .
          <span>{spliceNumberByPoint(data.balance)[1]}</span>
        </div>
      </div>
      <div className={classNames(styles.bottom, 'flex flex-shrink-0')}>
        <div className={styles.income}>
          <div>
            <span>收入</span>
            <div>
              {spliceNumberByPoint(data.income)[0]}
              .
              <span>{spliceNumberByPoint(data.income)[1]}</span>
            </div>
          </div>
        </div>
        <div className={styles.expand}>
          <div>
            <span>支出</span>
            <div>
              {spliceNumberByPoint(data.expand)[0]}
              .
              <span>{spliceNumberByPoint(data.expand)[1]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Top;
