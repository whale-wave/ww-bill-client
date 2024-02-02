import { FC, useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import logo from '../../assets/images/logo.png';
import { useNavigate } from 'react-router-dom';

const FirstScreen: FC = () => {
  const el = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    close();
  }, []);

  const close = () => {
    setTimeout(() => {
      /* eslint-disable */
      // el.current!.remove();
      navigate('/detail');
      /* eslint-disable */
    }, 1200);
  };

  return (
    <div
      className={classNames([
        styles.bg,
        'fixed w-full h-full flex flex-col justify-center items-center',
      ])}
      ref={el}
    >
      <div
        className={'flex flex-col justify-center items-center'}
        style={{
          transform: 'translateY(-33.333333%)',
        }}
      >
        <img className={styles.logo} src={logo} alt="蓝鲸记账" />
        <span className={styles['logo-text']}>蓝鲸记账</span>
      </div>
    </div>
  );
};

export default FirstScreen;
