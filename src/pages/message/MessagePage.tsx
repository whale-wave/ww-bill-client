import type { FC, ReactNode } from 'react';
import type { UserNotification } from '@/entities/notification';
import { Capacitor } from '@capacitor/core';
import { Button, ErrorBlock } from 'antd-mobile';
import { Bell, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appAvatar from '@/assets/brand/whale-logo-surface-浅色渐变背景.png';
import {
  useArchiveNotificationsMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification';
import { getNotificationTarget } from '@/pages/system-notify/model';
import { useTranslation } from '@/shared/i18n';
import { showDate } from '@/shared/lib/time';
import {
  AppButton,
  confirmAppAction,
  IllustratedEmptyState,
  PageHeader,
  PageLoadingState,
  showAppInfoDialog,
} from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
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
        <img alt="" className={styles.avatar} src={appAvatar} />
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

function SelectionControl({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className={`${styles.selectionControl} inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-solid border-border-primary text-white`}
      data-selected={isSelected}
    >
      {isSelected && <Check aria-hidden="true" size={15} strokeWidth={3} />}
    </span>
  );
}

const Message: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const contentRef = useRef<HTMLElement>(null);
  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const pendingActionsRef = useRef(new Set<string>());
  const isFetchingNextPageRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const platform = Capacitor.getPlatform() === 'android' ? 'android' : 'web';
  const notificationQuery = useNotificationsQuery({ params: { limit: PAGE_SIZE, platform } });
  const markReadMutation = useMarkNotificationReadMutation();
  const archiveNotificationsMutation = useArchiveNotificationsMutation();
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = notificationQuery;

  const selectedNotifications = useMemo(
    () => notificationQuery.data.filter(notification => selectedIds.has(notification.id)),
    [notificationQuery.data, selectedIds],
  );
  const isAllLoadedSelected = notificationQuery.data.length > 0
    && selectedNotifications.length === notificationQuery.data.length;

  useEffect(() => {
    isFetchingNextPageRef.current = isFetchingNextPage;
  }, [isFetchingNextPage]);

  useEffect(() => {
    const content = contentRef.current;
    const trigger = loadTriggerRef.current;
    if (!content || !trigger || !hasNextPage || isFetchingNextPage)
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || isFetchingNextPageRef.current)
          return;
        isFetchingNextPageRef.current = true;
        void fetchNextPage().finally(() => {
          isFetchingNextPageRef.current = false;
        });
      },
      { root: content, rootMargin: '0px 0px 160px' },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  const handleOpen = async (notification: UserNotification) => {
    const target = getNotificationTarget(notification.payload);
    if (pendingActionsRef.current.has(`open:${notification.id}`))
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
    if (target) {
      navigate(target);
    }
    else {
      const coverUrl = typeof notification.payload?.cover === 'string' ? notification.payload.cover : undefined;
      showAppInfoDialog({
        confirmText: t('nav.confirm'),
        description: (
          <div className="space-y-3 pt-1 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ww-soft">
              <span className="rounded-full bg-ww-surface-tint px-2.5 py-0.5 font-medium text-ww-mid">
                {t(`message.notificationCenter.types.${notification.type}`, { defaultValue: notification.type })}
              </span>
              <time dateTime={notification.createdAt}>{showDate(notification.createdAt)}</time>
            </div>
            {coverUrl && (
              <img
                alt=""
                className="max-h-48 w-full rounded-lg object-cover shadow-ww-xs"
                src={coverUrl}
              />
            )}
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ww-ink">
              {notification.content}
            </div>
          </div>
        ),
        title: notification.title,
      });
    }
    pendingActionsRef.current.delete(`open:${notification.id}`);
  };

  const handleToggleEditing = () => {
    setIsEditing(previous => !previous);
    setSelectedIds(new Set());
  };

  const handleToggleNotification = (notificationId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(notificationId))
        next.delete(notificationId);
      else
        next.add(notificationId);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds(() => isAllLoadedSelected
      ? new Set()
      : new Set(notificationQuery.data.map(notification => notification.id)));
  };

  const handleArchiveSelected = async () => {
    const actionKey = 'archive-selected';
    if (!selectedNotifications.length
      || archiveNotificationsMutation.isLoading
      || pendingActionsRef.current.has(actionKey)) {
      return;
    }
    pendingActionsRef.current.add(actionKey);
    try {
      const confirmed = await confirmAppAction({
        cancelText: t('nav.cancel'),
        confirmText: t('message.notificationCenter.delete'),
        description: t('message.notificationCenter.deleteSelectedConfirmContent', {
          count: selectedNotifications.length,
        }),
        title: t('message.notificationCenter.deleteSelectedConfirmTitle', {
          count: selectedNotifications.length,
        }),
        tone: 'danger',
      });
      if (!confirmed)
        return;

      const result = await archiveNotificationsMutation.mutateAsync(
        selectedNotifications.map(({ id, version }) => ({ id, version })),
      );
      await notificationQuery.refetch();
      setSelectedIds(new Set());
      setIsEditing(false);
      if (result.failedIds.length) {
        showAppError({
          content: t('message.notificationCenter.deleteSelectedFailed'),
          icon: 'fail',
        });
      }
    }
    finally {
      pendingActionsRef.current.delete(actionKey);
    }
  };

  return (
    <div className="page-new relative overflow-hidden" data-message-page>
      <PageHeader
        backLabel={t('nav.back')}
        onBack={() => navigate(-1)}
        right={(
          <button
            className="min-h-11 min-w-11 border-0 bg-transparent px-2 text-sm font-bold text-[var(--ww-theme-text-color)]"
            data-testid="message-edit"
            onClick={handleToggleEditing}
            type="button"
          >
            {isEditing ? t('nav.cancel') : t('action.edit')}
          </button>
        )}
        title={t('message.title')}
      />
      <main className={styles.content} ref={contentRef}>
        {notificationQuery.isLoading && (
          <PageLoadingState label={t('nav.loading')} testId="message-loading" />
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
          <IllustratedEmptyState
            className={styles.emptyState}
            description={t('message.notificationCenter.emptyHint')}
            icon={<Bell size={38} strokeWidth={1.8} />}
            testId="message-empty-state"
            title={t('message.notificationCenter.empty')}
          />
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
                  {isEditing
                    ? (
                        <button
                          aria-label={t('message.notificationCenter.selectNotification', {
                            title: notification.title,
                          })}
                          aria-pressed={selectedIds.has(notification.id)}
                          className={`${styles.itemButton} gap-3`}
                          data-testid={`message-select-${notification.id}`}
                          onClick={() => handleToggleNotification(notification.id)}
                          type="button"
                        >
                          <SelectionControl isSelected={selectedIds.has(notification.id)} />
                          <NotificationContent notification={notification} />
                        </button>
                      )
                    : (
                        <button
                          aria-label={notification.title}
                          className={styles.itemButton}
                          data-testid={`message-notification-action-${notification.id}`}
                          onClick={() => void handleOpen(notification)}
                          type="button"
                        >
                          <NotificationContent action={action} notification={notification} />
                        </button>
                      )}
                </article>
              );
            })}
            {notificationQuery.hasNextPage && (
              <div
                aria-live="polite"
                className="flex min-h-7 items-center justify-center text-xs leading-5 text-ww-soft"
                data-testid="message-load-trigger"
                ref={loadTriggerRef}
              >
                {notificationQuery.isFetchingNextPage && t('message.notificationCenter.loadingMore')}
              </div>
            )}
          </section>
        )}
      </main>
      {isEditing && notificationQuery.data.length > 0 && (
        <aside
          aria-label={t('message.notificationCenter.selectionActions')}
          className="flex shrink-0 items-center justify-between gap-[var(--ww-space-md)] border-t border-solid border-border-primary bg-ww-surface-raised px-[var(--ww-page-gutter)] py-[var(--ww-space-sm)] pb-[max(var(--ww-space-sm),env(safe-area-inset-bottom))] shadow-ww-xs"
        >
          <AppButton
            aria-pressed={isAllLoadedSelected}
            className="shrink-0"
            data-testid="message-select-all"
            onClick={handleToggleSelectAll}
            size="compact"
            variant="ghost"
          >
            <SelectionControl isSelected={isAllLoadedSelected} />
            <span>{t('message.notificationCenter.selectAll')}</span>
          </AppButton>
          <AppButton
            className="min-w-[108px] shrink-0"
            data-testid="message-delete-selected"
            disabled={!selectedNotifications.length || archiveNotificationsMutation.isLoading}
            onClick={() => void handleArchiveSelected()}
            size="compact"
            variant="danger"
          >
            {t('message.notificationCenter.deleteSelected', { count: selectedNotifications.length })}
          </AppButton>
        </aside>
      )}
    </div>
  );
};

export default Message;
