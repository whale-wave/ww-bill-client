import type { FC } from 'react';
import type { CategoryAmountType } from '@/api';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSound } from '@/shared/lib/play-sound';
import styles from './navBar.module.scss';

interface NavBarProps {
  change: (type: CategoryAmountType) => void;
  type: string;
  defaultSelectDate?: Date;
}

const NavBar: FC<NavBarProps> = ({ change, type, defaultSelectDate }) => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const handleChangeTab = (index: number) => {
    const type = index === 0 ? 'sub' : 'add';
    change(type);
    setActive(index);
  };

  const backFn = () => {
    playSound.turnPage();
    if (defaultSelectDate) {
      navigate(`/record-calendar?selectTime=${dayjs(defaultSelectDate).valueOf()}`, { replace: true });
    }
    else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const index = type === 'sub' ? 0 : 1;
    handleChangeTab(index);
  }, [type]);

  return (
    <div className={styles.top}>
      <span className={styles.cancel} onClick={() => backFn()}>
        取消
      </span>
      <p>
        {['支出', '收入'].map((item, index) => (
          <span
            key={index}
            className={index === active ? styles.active : ''}
            onClick={() => handleChangeTab(index)}
          >
            {item}
          </span>
        ))}
      </p>
    </div>
  );
};

export default NavBar;
