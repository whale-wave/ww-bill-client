import type { FC } from 'react';
import type { Bill } from '@/entities/record';
import classNames from 'classnames';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import { Icon } from '@/shared/ui';
import styles from './Content.module.scss';

type DataItem = {
  month: string;
} & Bill;

interface ContentProps {
  data: DataItem[];
}

const Content: FC<ContentProps> = memo(({ data }) => {
  const { t } = useTranslation('bill');
  const billTabType = useBillPageStore(({ billTabType }) => billTabType);
  const isMonthTabType = useMemo(() => billTabType === BillTabsType.MONTH, [billTabType]);

  const showData = useCallback((data: DataItem[]) => {
    if (data.length > 0)
      return data;
    return [{ month: `1${isMonthTabType ? t('month') : t('year')}`, income: 0, expand: 0, balance: 0 }];
  }, [isMonthTabType, t]);

  return (
    <div className={classNames(styles.wrapper, 'pb-4')}>
      <ul>
        <li className={styles.header}>
          <div>
            {isMonthTabType ? t('month') : t('year')}
          </div>
          <div>
            {isMonthTabType ? t('month') : t('year')}
            {t('income')}
          </div>
          <div>
            {isMonthTabType ? t('month') : t('year')}
            {t('expend')}
          </div>
          <div>
            {isMonthTabType ? t('month') : t('year')}
            {t('balance')}
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
