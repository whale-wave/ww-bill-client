import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { numType } from './index';
import { CalendarOutline, SearchOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { Triangle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Precision from '@/pages/record/detail/ui';
import config from '@/shared/config';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import { useVisibleAmount } from '../model/useVisibleAmount';
import styles from './top.module.scss';

interface TopProps {
  numExpendIncome: numType | [];
  selectTime: Dayjs;
  setSelectTime: (val: Dayjs) => void;
}

const Top: FC<TopProps> = ({ numExpendIncome, selectTime, setSelectTime }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const {
    visibleAmount,
    visibleAmountSwitch,
    isVisibleAmount,
    onToggleVisibleAmount,
  } = useVisibleAmount();

  const tabs = [
    {
      name: t('bill:title'),
      iconName: 'bill',
      click: () => navigate(ROUTES_PATH.BILL.getPath()),
    },
    {
      name: t('budget:title'),
      iconName: 'budget',
      click: () => {
        navigate(ROUTES_PATH.BUDGET.getPath());
      },
    },
    {
      name: t('common:commonFunctions.assetSteward'),
      iconName: 'asset-steward',
      click: () => {
        navigate(ROUTES_PATH.ASSET.getPath());
      },
    },
  ];

  const [visible1, setVisible1] = useState(false);

  const onPrecisionFn = () => {
    setVisible1(true);
  };

  const onChangeDateToggle = () => {
    setVisible1(false);
  };

  const ChangeTimeDate = async (time: string) => {
    sessionStorage.setItem('timeDate', time);
    setSelectTime(dayjs(time));
  };

  const onGoToSearchRecordPage = useCallback(() => {
    navigate('/search-record');
  }, [navigate]);

  const onGoToRecordCalendarPage = useCallback(() => {
    if (dayjs().isSame(selectTime, 'month')) {
      navigate(`/record-calendar?selectTime=${dayjs().valueOf()}`);
    }
    else {
      navigate(`/record-calendar?selectTime=${selectTime.valueOf()}`);
    }
  }, [navigate, selectTime]);

  return (
    <div className={cn(styles.top, 'record-detail-top')}>
      <div className={styles.title}>{config.appName}</div>
      <div className={cn([styles.left, styles['top-text-1-wrapper']])}>
        <div className={styles['top-text-1']}>{selectTime?.format('YYYY年')}</div>
        <div className={cn(styles['left-bottom'])}>
          <div
            className="h-[40%] w-[1px] bg-black333 absolute -right-2 bottom-1 opacity-50"
          >
          </div>
          <div className={cn(styles['bottom-wrapper'], 'w-[300px]')} onClick={onPrecisionFn}>
            <span className={styles.month}>{selectTime?.format('MM')}</span>
            {t('common:time.month')}
            <Triangle
              className={cn(
                'ml-1 mb-[2px] inline-block transition-transform duration-200 ease-in-out',
                visible1 ? '[transform:rotate(0deg)]' : '[transform:rotate(180deg)]',
              )}
              fill="currentColor"
              size={10}
              stroke="none"
            />
            <Precision
              selectTime={selectTime}
              visible1={visible1}
              change={() => onChangeDateToggle()}
              changeTime={(time: string) =>
                ChangeTimeDate(time)}
            />
          </div>
        </div>
      </div>
      <div className={cn([styles.middle, styles['top-text-1-wrapper']])}>
        <div className={styles['top-text-1']}>{t('common:amount.income')}</div>
        <div className={styles['middle-bottom']}>
          <div className={styles['bottom-wrapper']}>
            {isVisibleAmount
              ? (
                  <>
                    <span className={styles.big}>
                      {numExpendIncome[1] && numExpendIncome[1].length
                        ? numExpendIncome[1][0]
                        : '0'}
                    </span>
                    <span className={styles.bigNum}>
                      {numExpendIncome[1]
                        && numExpendIncome[1].length
                        && numExpendIncome[1][1] !== ''
                        ? `.${numExpendIncome[1][1]}`
                        : '.00'}
                    </span>
                  </>
                )
              : (
                  <span className={cn(styles.big, 'font-bold')}>*******</span>
                )}
          </div>
        </div>
      </div>
      <div className={cn([styles.right, styles['top-text-1-wrapper']])}>
        <div className={styles['top-text-1']}>{t('common:amount.expend')}</div>
        <div className={styles['right-bottom']}>
          <div className={styles['bottom-wrapper']}>
            {isVisibleAmount
              ? (
                  <>
                    <span className={styles.big}>
                      {numExpendIncome[0] && numExpendIncome[0].length
                        ? numExpendIncome[0][0]
                        : '0'}
                    </span>
                    <span className={styles.bigNum}>
                      {numExpendIncome[0]
                        && numExpendIncome[0].length
                        && numExpendIncome[0][1] !== ''
                        ? `.${numExpendIncome[0][1]}`
                        : '.00'}
                    </span>
                  </>
                )
              : (
                  <span className={cn(styles.big, 'font-bold')}>*******</span>
                )}
          </div>
        </div>
      </div>
      {visibleAmountSwitch
        ? (
            <div
              className="right-4 bottom-[116px] absolute text-lg px-1"
              onClick={onToggleVisibleAmount}
            >
              {!visibleAmount ? <Icon name="eye-close" /> : <Icon name="eye" />}
            </div>
          )
        : null}
      <div className="absolute top-0 right-0 p-2">
        <SearchOutline className="text-lg mr-3" onClick={onGoToSearchRecordPage} />
        <CalendarOutline className="text-lg mr-3" onClick={onGoToRecordCalendarPage} />
      </div>
      <div
        className={cn(
          styles['list-wrapper'],
          'w-full absolute bottom-0 left-1/2 [transform:translateX(-50%)]',
        )}
      >
        <div className={cn(styles.list, 'h-full flex')}>
          {tabs.map(tab => (
            <div
              className={cn(
                styles.tab,
                'flex-shrink-0 flex-grow flex flex-col justify-center items-center',
              )}
              key={tab.name}
              onClick={tab.click}
            >
              <Icon name={tab.iconName} />
              <span>{tab.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Top;
