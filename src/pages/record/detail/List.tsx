import dayjs, { type Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import c from 'classnames';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { Icon } from '@/shared/ui';
import { useRecordList } from '../model/useRecordList';
import styles from './list.module.scss';

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
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const { record } = useRecordList(selectTime, change);

  const recordFn = (chunk: recordChildren) => {
    playSound.turnPage();
    navigate(`/editing/${chunk.id}`, { state: chunk });
  };

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
                            {t('common:amount.income')}
                            ：
                            {item[5]}
                          </div>
                        )
                      : (
                          ''
                        )}
                    <div className={styles.right}>
                      {t('common:amount.expend')}
                      ：
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
              <span>{t('common:empty')}</span>
            </div>
          )}
    </div>
  );
});

export default List;
