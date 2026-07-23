import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { numType } from './DetailPage';
import dayjs from 'dayjs';
import { Eye, EyeOff, Triangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerSwitcherHeader } from '@/features/ledger-switcher';
import Precision from '@/pages/record/detail/ui';
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

  const headerActions = useMemo(() => {
    const calendarTime = dayjs().isSame(selectTime, 'month')
      ? dayjs().valueOf()
      : selectTime.valueOf();

    return [
      {
        key: 'search-records',
        path: ROUTES_PATH.SEARCH_RECORD.getPath(),
        text: t('search.title'),
      },
      {
        key: 'record-calendar',
        path: `${ROUTES_PATH.RECORD_CALENDAR.getPath()}?selectTime=${calendarTime}`,
        text: t('calendar.title'),
      },
    ];
  }, [selectTime, t]);

  return (
    <div className={cn(styles.top, 'record-detail-top')}>
      <LedgerSwitcherHeader leadingActions={headerActions} />
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
                visible1 ? 'rotate-0' : 'rotate-180',
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
              {!visibleAmount ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
            </div>
          )
        : null}
      <div
        className={cn(
          styles['list-wrapper'],
          'w-full absolute bottom-0 left-1/2 -translate-x-1/2',
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
