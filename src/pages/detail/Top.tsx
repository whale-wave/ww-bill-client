import { Icon } from 'bw-mobile';
import c from 'classnames';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutline } from 'antd-mobile-icons';
import styles from './top.module.scss';
import type { numType } from './index';
import Precision from '@/pages/detail/component';
import { useSystemStore } from '@/store';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/hooks';

interface TopProps {
  change: (val: string) => void;
  numExpendIncome: numType | [];
}

const Top: FC<TopProps> = ({ change, numExpendIncome }) => {
  const navigate = useNavigate();
  // TODO: 需要调整为获取指定的字段
  const { setVisibleAmount, visibleAmount, visibleAmountSwitch, setUserAppConfig }
    = useSystemStore();

  const { data: userAppConfig } = useGetUserAppConfigQuery();
  useEffect(() => {
    if (!userAppConfig)
      return;
    setUserAppConfig(userAppConfig);
  }, [userAppConfig]);

  const [patchUserAppConfigMutate] = usePatchUserAppConfigMutation();

  const tabs = [
    {
      name: '账单',
      iconName: 'bill',
      click: () => navigate('/bill'),
    },
    {
      name: '资产',
      iconName: 'budget',
      click: () => null,
    },
    {
      name: '资产管家',
      iconName: 'asset-steward',
      click: () => null,
    },
  ];

  const [visible1, setVisible1] = useState(false);
  const [yearMoth, setYearMoth] = useState<string[]>([]);

  const PrecisionFn = () => {
    setVisible1(true);
  };

  const ChangeDateToggle = () => {
    setVisible1(false);
  };

  const ChangeTimeDate = async (time: string, arr: Array<string>) => {
    sessionStorage.setItem('setYearMoth', JSON.stringify(arr));
    sessionStorage.setItem('timeDate', JSON.stringify(time));
    setYearMoth(arr);
    change(time);
  };

  useEffect(() => {
    const getYearMoth = sessionStorage.getItem('setYearMoth');
    const timeDate = sessionStorage.getItem('timeDate');
    getYearMoth && setYearMoth(JSON.parse(getYearMoth));
    timeDate && change(timeDate);
    if (!getYearMoth) {
      const time2 = new Date();
      const Y = `${time2.getFullYear()}年`;
      const M
        = time2.getMonth() + 1 < 10
          ? `0${time2.getMonth() + 1}`
          : time2.getMonth() + 1;

      const arrayDate = [String(Y), String(M)];
      setYearMoth(arrayDate);
    }
  }, []);

  const isVisibleAmount = useMemo(() => {
    if (!visibleAmountSwitch) {
      return true;
    }

    return visibleAmount;
  }, [visibleAmount, visibleAmountSwitch]);

  const onToggleVisibleAmount = useCallback(async () => {
    setVisibleAmount(!visibleAmount);
    await patchUserAppConfigMutate({
      isDisplayAmount: !visibleAmount,
    });
  }, [visibleAmount]);

  const onGoToSearchRecordPage = useCallback(() => {
    navigate('/search-record');
  }, []);

  return (
    <div className={styles.top}>
      <div className={styles.title}>蓝鲸记账</div>
      <div className={c([styles.left, styles['top-text-1-wrapper']])}>
        <div className={styles['top-text-1']}>{yearMoth[0]}</div>
        <div className={c(styles['left-bottom'])}>
          <div
            className="h-[40%] w-[1px] bg-black333 absolute -right-0 bottom-1 opacity-50"
          >
          </div>
          <div className={styles['bottom-wrapper']} onClick={PrecisionFn}>
            <span className={styles.month}>{yearMoth[1]}</span>
            月
            {' '}
            <Icon name="show-bottom" className="text-[10px] mb-[2px]" />
            <Precision
              visible1={visible1}
              change={() => ChangeDateToggle()}
              changeTime={(time: string, arr: Array<string>) =>
                ChangeTimeDate(time, arr)}
            />
          </div>
        </div>
      </div>
      <div className={c([styles.middle, styles['top-text-1-wrapper']])}>
        <div className={styles['top-text-1']}>收入</div>
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
                <span className={c(styles.big, 'font-bold')}>*******</span>
                )}
          </div>
        </div>
      </div>
      <div className={c([styles.right, styles['top-text-1-wrapper']])}>
        <div className={styles['top-text-1']}>支出</div>
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
                <span className={c(styles.big, 'font-bold')}>*******</span>
                )}
          </div>
        </div>
      </div>
      {visibleAmountSwitch
        ? (
          <div
            className="right-4 bottom-[116px] absolute text-[18px] px-1"
            onClick={onToggleVisibleAmount}
          >
            {!visibleAmount ? <Icon name="eye-close" /> : <Icon name="eye" />}
          </div>
          )
        : null}
      <div className="absolute top-0 right-0 p-2">
        <SearchOutline className="text-[18px] mr-3" onClick={onGoToSearchRecordPage} />
      </div>
      <div
        className={c(
          styles['list-wrapper'],
          'w-full absolute bottom-0 left-1/2',
        )}
        style={{
          transform: 'translateX(-50%)',
        }}
      >
        <div className={c(styles.list, 'h-full flex')}>
          {tabs.map(tab => (
            <div
              className={c(
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
