import { NavBar } from 'bw-mobile';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBlock } from 'antd-mobile';
import styles from './index.module.scss';

const Message: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      <NavBar
        onBack={() => navigate(-1)}
        back="返回"
        className={styles['nav-bar']}
      >
        消息
      </NavBar>
      <div className="flex-grow flex justify-center items-center">
        <ErrorBlock status="empty" />
      </div>
    </div>
  );
};

export default Message;
