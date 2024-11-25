import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import styles from './index.module.css';
import config from '@/config';

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
        <img className={styles.logo} src={logo} alt={config.appName} />
        <span className={styles['logo-text']}>{config.appName}</span>
      </div>
    </div>
  );
};

export default FirstScreen;
