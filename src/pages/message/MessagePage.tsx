import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
import styles from './index.module.scss';

const Message: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const messageItems = [
    {
      title: t('message.newFollow.title'),
      description: t('message.newFollow.description'),
      path: ROUTES_PATH.MESSAGE_NEW_FOLLOW.getPath(),
    },
    {
      title: t('message.comment.title'),
      description: t('message.comment.description'),
      path: ROUTES_PATH.MESSAGE_COMMENT_LIST.getPath(),
    },
    {
      title: t('message.systemNotify.title'),
      description: t('message.systemNotify.description'),
      path: ROUTES_PATH.MESSAGE_SYSTEM_NOTIFY.getPath(),
    },
  ];

  return (
    <div className="page">
      <NavBar
        onBack={() => navigate(-1)}
        back={t('nav.back')}
        className={styles['nav-bar']}
      >
        {t('message.title')}
      </NavBar>
      <div className={styles.content}>
        <div className={styles.summary}>
          {t('message.emptySummary')}
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
