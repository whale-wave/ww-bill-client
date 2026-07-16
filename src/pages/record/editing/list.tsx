import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import c from 'classnames';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { getTimedate, getTimeDateYear, getWeekByDay } from '@/shared/lib/date-time';
import { FixedPin } from '@/shared/ui';
import styles from './list.module.scss';

interface stateType {
  state: recordChildren;
}

const List: FC<stateType> = ({ state }) => {
  const { t } = useTranslation('record');
  const navigate = useNavigate();
  const handleShare = () => {
    navigate(ROUTES_PATH.SHARE.getPath(), {
      state: { record: state },
    });
  };
  const displayItems = useMemo(() => {
    const typeMap: Record<string, string> = {
      sub: t('type.expense'),
      add: t('type.income'),
    };

    const date = new Date(state.time);
    const timeDate = getTimeDateYear(date);
    const timeDate1 = getTimedate(date);
    const weekByDay = getWeekByDay(timeDate1);

    return [
      { label: t('edit.type'), value: typeMap[state.type] || state.type },
      { label: t('edit.amount'), value: state.amount },
      { label: t('edit.date'), value: `${timeDate}  ${weekByDay}` },
      { label: t('edit.remark'), value: state.remark },
    ];
  }, [state, t]);

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
      <FixedPin onClick={handleShare}>{t('edit.share')}</FixedPin>
    </div>
  );
};

export default List;
