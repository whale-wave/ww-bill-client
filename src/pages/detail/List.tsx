import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import c from 'classnames';
import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/index.ts';
import { useGetRecordQuery } from '@/hooks';
import { playSound } from '@/modules';
import { math } from '@/utils';
import { getTimeValueFn, getWeekByDay } from '@/utils/DataTime';
import styles from './list.module.scss';

export interface recordChildren {
  amount: string;
  category: {
    createdAt: string;
    icon: string;
    id: number;
    name: string;
    updatedAt: string;
  };
  createdAt: string;
  id: number;
  remark: string;
  time: string;
  type: string;
  updatedAt: string;
  status?: boolean;
}

type recordType = [
  string,
  string,
  number,
  Array<recordChildren>,
  number,
  number,
];

type numType = [Array<string>, Array<string>];

interface timeDateProp {
  selectTime?: Dayjs;
  change: (arr: numType) => void;
}

const List: FC<timeDateProp> = memo(({ selectTime, change }) => {
  const [record, setRecord] = useState<recordType[]>([]);
  const navigate = useNavigate();

  const { data } = useGetRecordQuery({
    params: { startDate: selectTime?.format('YYYY-MM-DD') },
    options: {
      enabled: !!selectTime,
    },
  });

  const Recording = async () => {
    if (!data)
      return;
    const { data: lists, expend, income } = data;

    const leftNum: number = expend;
    const leftNum2: number = income;
    let array: Array<string> = [];
    let array2: Array<string> = [];
    if (String(expend).includes('.')) {
      array = leftNum.toString().split('.');
    }
    else {
      array = [`${leftNum}`, ''];
    }
    if (String(income).includes('.')) {
      array2 = leftNum2.toString().split('.');
    }
    else {
      array2 = [`${leftNum2}`, ''];
    }
    change([array, array2]);

    const record: Array<recordType> = [];
    const recordHash: {
      [string: string]: [
        string,
        string,
        number,
        recordChildren[],
        number,
        number,
      ];
    } = {};
    lists.forEach((item) => {
      const time2 = new Date(item.time).getTime(); // 这条数据添加进去时候的时间
      // 时间戳转换为普通时间
      const time = new Date(Number.parseInt(String(time2)))
        .toLocaleString()
        .replace(/:\d{1,2}$/, ' ');
      // 创建的时间传递过去  返回改天为星期几
      const Week = getWeekByDay(time);

      // 创建这个数据的时间
      const data = new Date(item.time);
      const createdTime = getTimeValueFn(data);

      if (createdTime in recordHash) {
        recordHash[createdTime][3].push({ ...item });
      }
      else {
        recordHash[createdTime] = [
          createdTime,
          Week,
          time2,
          [{ ...item }],
        ] as unknown as recordType;
      }
    });

    const itemRecord = Object.keys(recordHash);
    itemRecord.forEach((item) => {
      // recordHash[item][3].forEach((item) => {
      //   item.time = new Date(item.time).getTime(); //这是记账每条数据添加进去时候的时间
      // });
      record.push(recordHash[item]);
    });
    let max;
    for (let i = 0; i < record.length; i++) {
      // 外层循环一次，就拿record[i] 和 内层循环record.legend次的 record[j] 做对比
      for (let j = i; j < record.length; j++) {
        if (record[i][2] < record[j][2]) {
          max = record[j];
          record[j] = record[i];
          record[i] = max;
        }
      }
    }

    record.forEach((item) => {
      let addAmount = 0;
      let reduceAmount = 0;
      item[3].forEach((chunk) => {
        if (chunk.type === 'sub') {
          reduceAmount = math.add(chunk.amount, reduceAmount).toNumber();
        }
        else if (chunk.type === 'add') {
          addAmount = math.add(chunk.amount, addAmount).toNumber();
        }
      });
      item.push(reduceAmount, addAmount);
    });

    setRecord(record);
  };

  const recordFn = (chunk: recordChildren) => {
    playSound.turnPage();
    navigate(`/editing/${chunk.id}`, { state: chunk });
  };

  useEffect(() => {
    void Recording();
  }, [selectTime, data]);

  return (
    <div className={styles.wrapper}>
      {record.length
        ? (
            <>
              {record.map((item: recordType, index) => (
                <div className={styles.group} key={index}>
                  <div className={styles.title}>
                    <div className={styles.left}>
                      {item[0]}
                      {' '}
                      {item[1]}
                    </div>
                    {item[5] > 0
                      ? (
                          <div className={styles.right}>
                            收入：
                            {item[5]}
                          </div>
                        )
                      : (
                          ''
                        )}
                    <div className={styles.right}>
                      支出：
                      {item[4]}
                    </div>
                  </div>
                  {item[3].map((chunk, index) => (
                    <div
                      className={styles.record}
                      key={index}
                      onClick={() => recordFn(chunk)}
                    >
                      <div className={c(styles.left, 'flex-shrink-0')}>
                        <div
                          className={c(
                            styles.icon,
                            'flex justify-center items-center',
                          )}
                        >
                          <Icon
                            name={chunk.category.icon}
                            style={{ fontSize: 20 }}
                          />
                        </div>
                      </div>
                      <div className={c(styles.right, 'flex flex-grow-1 min-w-0')}>
                        <div
                          className={c(
                            styles.remark,
                            'overflow-hidden overflow-ellipsis whitespace-nowrap',
                          )}
                        >
                          {chunk.remark}
                        </div>
                        <div className={c(styles.price, 'ml-[12px]')}>
                          {chunk.type === 'add' ? chunk.amount : -chunk.amount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="h-[30px] flex-shrink-0"></div>
            </>
          )
        : (
            <div className={styles['not-data']}>
              <Icon name="not-data" />
              <span>暂无数据</span>
            </div>
          )}
    </div>
  );
});

export default List;
