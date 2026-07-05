import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { Icon, NavBar } from '@/shared/ui';
import styles from './top.module.scss';

interface stateType {
  state: recordChildren;
}

const Top: FC<stateType> = ({ state }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const back = () => {
    playSound.turnPage();
    if (state?.status) {
      navigate('/detail');
    }
    else {
      navigate(-1);
    }
  };

  return (
    <div>
      <NavBar backArrow={false} onBack={() => back()} back={t('common:nav.back')}></NavBar>
      <div className={styles.top}>
        <div className={styles.main}>
          <div
            className={classNames(
              styles.icon,
              'flex justify-center items-center',
            )}
          >
            <Icon name={state.category.icon} style={{ fontSize: 36 }} />
          </div>
          <span>{state.category.name}</span>
        </div>
      </div>
    </div>
  );
};

export default Top;
