import type { FC, ReactNode } from 'react';
import type { UserNotification } from '@/entities/notification';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import appLogo from '@/assets/bill-logo-v2-transparent.png';
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification';
import { getNotificationTarget } from '@/pages/system-notify/model';
import { useTranslation } from '@/shared/i18n';
import { showDate } from '@/shared/lib/time';
import { NavBar } from '@/shared/ui';
import styles from './index.module.scss';

const PAGE_SIZE = 20;

function NotificationContent({
  action,
  notification,
}: {
  action?: ReactNode;
  notification: UserNotification;
}) {
  const { t } = useTranslation('common');
  const isUnread = notification.status === UserNotificationStatus.UNREAD;

  return (
    <>
      <span className={styles.avatarWrap}>
        <img alt="" className={styles.avatar} src={appLogo} />
        {isUnread && (
          <span
            aria-label={t('message.notificationCenter.unread')}
            className={styles.unreadDot}
            data-unread="true"
          />
        )}
      </span>
      <span className={styles.itemContent}>
        <span className={styles.itemHeader}>
          <span className={styles.title}>{notification.title}</span>
          <time className={styles.time} dateTime={notification.createdAt}>
            {showDate(notification.createdAt)}
          </time>
        </span>
        <span className={styles.description}>
          {notification.content}
          {action}
        </span>
      </span>
    </>
  );
}

const Message: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const pendingActionsRef = useRef(new Set<string>());
  const notificationQuery = useNotificationsQuery({ params: { limit: PAGE_SIZE } });
  const markReadMutation = useMarkNotificationReadMutation();

  const handleOpen = async (notification: UserNotification) => {
    const target = getNotificationTarget(notification.payload);
    if (!target || pendingActionsRef.current.has(`open:${notification.id}`))
      return;
    pendingActionsRef.current.add(`open:${notification.id}`);
    if (notification.status === UserNotificationStatus.UNREAD) {
      try {
        await markReadMutation.mutateAsync({
          id: notification.id,
          version: notification.version,
        });
      }
      catch {
        // Reading is best effort and must not block the notification's primary action.
      }
    }
    navigate(target);
    pendingActionsRef.current.delete(`open:${notification.id}`);
  };

  return (
    <div className="page">
      <NavBar
        back={t('nav.back')}
        className={styles.navBar}
        onBack={() => navigate(-1)}
      >
        {t('message.title')}
      </NavBar>
      <main className={styles.content}>
        {notificationQuery.isLoading && (
          <div className={styles.state}>
            <SpinLoading />
          </div>
        )}
        {notificationQuery.isError && (
          <div className={styles.state}>
            <ErrorBlock
              description={t('message.notificationCenter.loadFailedHint')}
              status="default"
              title={t('message.notificationCenter.loadFailed')}
            />
            <Button color="primary" onClick={() => void notificationQuery.refetch()} size="small">
              {t('message.notificationCenter.retry')}
            </Button>
          </div>
        )}
        {!notificationQuery.isLoading
          && !notificationQuery.isError
          && notificationQuery.data.length === 0 && (
          <div className={styles.state}>
            <ErrorBlock
              description={t('message.notificationCenter.emptyHint')}
              status="empty"
              title={t('message.notificationCenter.empty')}
            />
          </div>
        )}
        {!notificationQuery.isLoading
          && !notificationQuery.isError
          && notificationQuery.data.length > 0 && (
          <section aria-label={t('message.title')} className={styles.list}>
            {notificationQuery.data.map((notification) => {
              const target = getNotificationTarget(notification.payload);
              const isJoinRequest = notification.type === UserNotificationType.LEDGER_JOIN_REQUEST;
              const action = target && isJoinRequest
                ? (
                    <span className={styles.handle}>
                      {t('message.notificationCenter.handle')}
                    </span>
                  )
                : undefined;

              return (
                <article
                  className={styles.item}
                  data-testid={`message-notification-${notification.id}`}
                  key={notification.id}
                >
                  {target && isJoinRequest
                    ? (
                        <button
                          aria-label={`${notification.title} ${t('message.notificationCenter.handle')}`}
                          className={styles.itemButton}
                          data-testid={`message-notification-action-${notification.id}`}
                          onClick={() => void handleOpen(notification)}
                          type="button"
                        >
                          <NotificationContent action={action} notification={notification} />
                        </button>
                      )
                    : (
                        <div className={styles.itemStatic}>
                          <NotificationContent notification={notification} />
                        </div>
                      )}
                </article>
              );
            })}
            {notificationQuery.hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  data-testid="message-load-more"
                  disabled={notificationQuery.isFetchingNextPage}
                  fill="none"
                  loading={notificationQuery.isFetchingNextPage}
                  onClick={() => void notificationQuery.fetchNextPage()}
                  size="small"
                >
                  {notificationQuery.isFetchingNextPage
                    ? t('message.notificationCenter.loadingMore')
                    : t('message.notificationCenter.loadMore')}
                </Button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Message;
