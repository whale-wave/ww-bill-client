import type { FC } from 'react';
import classNames from 'classnames';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '@/shared/config';
import newLogo from '../../assets/images/bill-pingmian.png';
import styles from './index.module.css';

const FirstScreen: FC = () => {
  const el = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const close = () => {
    setTimeout(() => {
      // el.current!.remove();
      navigate('/detail');
    }, 1200);
  };

  useEffect(() => {
    close();
  }, []);

  return (
    <div
      className={classNames([
        styles.bg,
        'fixed w-full h-full flex flex-col justify-center items-center',
      ])}
      ref={el}
    >
      <div
        className="flex flex-col justify-center items-center"
        style={{
          transform: 'translateY(-33.333333%)',
        }}
      >
        <img
          className="w-[200px] h-[200px]"
          src={newLogo}
          alt={config.appName}
        />
        <span className={classNames(styles['logo-text'], 'font-display')}>{config.appName}</span>
      </div>
    </div>
  );
};

export default FirstScreen;
