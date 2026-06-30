import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '@/components/ui/index.ts';
import { ROUTES_PATH } from '@/constants/route';
import styles from './index.module.scss';

const messageItems = [
  {
    title: '新关注',
    description: '进入查看最新关注你的用户',
    path: ROUTES_PATH.MESSAGE_NEW_FOLLOW.getPath(),
  },
  {
    title: '评论',
    description: '进入查看收到的最新评论',
    path: ROUTES_PATH.MESSAGE_COMMENT_LIST.getPath(),
  },
  {
    title: '系统通知',
    description: '进入查看系统通知和提醒',
    path: ROUTES_PATH.MESSAGE_SYSTEM_NOTIFY.getPath(),
  },
];

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
      <div className={styles.content}>
        <div className={styles.summary}>
          暂无首页未读或摘要数据，选择下方入口查看最新消息。
        </div>
        <div className={styles.list}>
          {messageItems.map(item => (
            <button
              key={item.path}
              type="button"
              className={styles.item}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.itemContent}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.description}>{item.description}</span>
              </span>
              <span className={styles.arrow} aria-hidden="true">
                &gt;
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Message;
