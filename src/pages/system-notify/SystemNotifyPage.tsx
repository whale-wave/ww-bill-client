import type { ChangeEvent } from 'react';
import type {
  UserNotification,
  UserNotificationStatus as UserNotificationStatusValue,
  UserNotificationType as UserNotificationTypeValue,
} from '@/entities/notification';
import {
  Button,
  Dialog,
  ErrorBlock,
  Toast,
} from 'antd-mobile';
import { useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useArchiveNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  UserNotificationStatus,
  UserNotificationType,
} from '@/entities/notification';
import { useTranslation } from '@/shared/i18n';
import { showDate } from '@/shared/lib/time';
import { NavBar, PageLoadingState } from '@/shared/ui';
import { getNotificationTarget } from './model';

const PAGE_SIZE = 20;
const STATUS_VALUES = new Set<string>(Object.values(UserNotificationStatus));
const TYPE_VALUES = new Set<string>(Object.values(UserNotificationType));

function parseStatus(value: string | null) {
  return value && STATUS_VALUES.has(value)
    ? value as UserNotificationStatusValue
    : undefined;
}

function parseType(value: string | null) {
  return value && TYPE_VALUES.has(value)
    ? value as UserNotificationTypeValue
    : undefined;
}

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error !== null && 'statusCode' in error
    ? error.statusCode
    : undefined;
}

function NotificationItem({
  notification,
  onArchive,
  onMarkRead,
  onOpen,
  isMutating,
}: {
  notification: UserNotification;
  onArchive: (notification: UserNotification) => void;
  onMarkRead: (notification: UserNotification) => void;
  onOpen: (notification: UserNotification) => void;
  isMutating: boolean;
}) {
  const { t } = useTranslation('common');
  const isUnread = notification.status === UserNotificationStatus.UNREAD;
  const isArchived = notification.status === UserNotificationStatus.ARCHIVED;
  const target = getNotificationTarget(notification.payload);

  return (
    <article className="border-b border-[#ebebeb] bg-white px-4 py-3 last:border-b-0">
      <div className="flex items-start gap-2">
        <span
          className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-[var(--ww-theme-color)]' : 'bg-transparent'}`}
          data-unread={isUnread ? 'true' : 'false'}
          aria-label={isUnread ? t('message.notificationCenter.unread') : undefined}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className={`min-w-0 text-[15px] leading-[22px] text-[#323334] ${isUnread ? 'font-semibold' : 'font-normal'}`}>
              {notification.title}
            </h2>
            <time
              className="shrink-0 text-xs leading-[20px] text-[#969696]"
              dateTime={notification.createdAt}
            >
              {showDate(notification.createdAt)}
            </time>
          </div>
          <div className="mt-1 inline-flex rounded bg-[#f2f3f5] px-1.5 py-0.5 text-xs text-[#747374]">
            {t(`message.notificationCenter.types.${notification.type}`)}
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-[#747374]">
            {notification.content}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            {target && (
              <Button
                size="mini"
                fill="none"
                data-testid={`notification-open-${notification.id}`}
                onClick={() => onOpen(notification)}
              >
                {t('message.notificationCenter.open')}
              </Button>
            )}
            {isUnread && (
              <Button
                size="mini"
                fill="none"
                disabled={isMutating}
                data-testid={`notification-read-${notification.id}`}
                onClick={() => onMarkRead(notification)}
              >
                {t('message.notificationCenter.markRead')}
              </Button>
            )}
            {!isArchived && (
              <Button
                size="mini"
                fill="none"
                color="danger"
                disabled={isMutating}
                data-testid={`notification-delete-${notification.id}`}
                onClick={() => onArchive(notification)}
              >
                {t('message.notificationCenter.delete')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function SystemNotifyPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingActionsRef = useRef(new Set<string>());
  const status = parseStatus(searchParams.get('status'));
  const type = parseType(searchParams.get('type'));
  const filters = useMemo(() => ({
    limit: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  }), [status, type]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useNotificationsQuery({ params: filters });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const archiveMutation = useArchiveNotificationMutation();
  const isMutating = markReadMutation.isLoading
    || markAllReadMutation.isLoading
    || archiveMutation.isLoading;

  const runOnce = async (key: string, action: () => Promise<unknown>) => {
    if (pendingActionsRef.current.has(key))
      return;
    pendingActionsRef.current.add(key);
    try {
      await action();
    }
    catch (error) {
      const errorStatus = getErrorStatus(error);
      if (errorStatus !== 401 && errorStatus !== 403 && errorStatus !== 409) {
        Toast.show({
          content: error instanceof Error && error.message
            ? error.message
            : t('message.notificationCenter.actionFailed'),
        });
      }
    }
    finally {
      pendingActionsRef.current.delete(key);
    }
  };

  const handleFilterChange = (
    name: 'status' | 'type',
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    if (event.target.value)
      nextSearchParams.set(name, event.target.value);
    else
      nextSearchParams.delete(name);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleMarkRead = (notification: UserNotification) => {
    void runOnce(`read:${notification.id}`, () => markReadMutation.mutateAsync({
      id: notification.id,
      version: notification.version,
    }));
  };

  const handleMarkAllRead = () => {
    void runOnce('read-all', () => markAllReadMutation.mutateAsync());
  };

  const handleArchive = (notification: UserNotification) => {
    void runOnce(`archive:${notification.id}`, async () => {
      const confirmed = await Dialog.confirm({
        title: t('message.notificationCenter.deleteConfirmTitle'),
        content: t('message.notificationCenter.deleteConfirmContent'),
        confirmText: t('message.notificationCenter.delete'),
        cancelText: t('nav.cancel'),
      });
      if (!confirmed)
        return;
      await archiveMutation.mutateAsync({
        id: notification.id,
        version: notification.version,
      });
    });
  };

  const handleOpen = (notification: UserNotification) => {
    const target = getNotificationTarget(notification.payload);
    if (target)
      navigate(target);
  };

  return (
    <div className="page bg-[#f5f5f5]">
      <NavBar
        back={t('nav.back')}
        onBack={() => navigate(-1)}
        className="bg-white"
        right={(
          <button
            type="button"
            className="border-0 bg-transparent px-0 text-sm text-[#323334] disabled:text-[#b7babd]"
            disabled={isMutating}
            data-testid="notification-read-all"
            onClick={handleMarkAllRead}
          >
            {t('message.notificationCenter.markAllRead')}
          </button>
        )}
      >
        {t('message.systemNotify.title')}
      </NavBar>

      <main className="min-h-0 flex-1 overflow-auto pb-6">
        <div className="sticky top-0 z-10 flex gap-2 border-y border-[#ebebeb] bg-white px-4 py-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t('message.notificationCenter.statusFilter')}</span>
            <select
              className="h-9 w-full rounded border border-[#d7d7d7] bg-white px-2 text-sm text-[#323334]"
              aria-label={t('message.notificationCenter.statusFilter')}
              value={status ?? ''}
              onChange={event => handleFilterChange('status', event)}
            >
              <option value="">{t('message.notificationCenter.allStatuses')}</option>
              {Object.values(UserNotificationStatus).map(value => (
                <option key={value} value={value}>
                  {t(`message.notificationCenter.statuses.${value}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t('message.notificationCenter.typeFilter')}</span>
            <select
              className="h-9 w-full rounded border border-[#d7d7d7] bg-white px-2 text-sm text-[#323334]"
              aria-label={t('message.notificationCenter.typeFilter')}
              value={type ?? ''}
              onChange={event => handleFilterChange('type', event)}
            >
              <option value="">{t('message.notificationCenter.allTypes')}</option>
              {Object.values(UserNotificationType).map(value => (
                <option key={value} value={value}>
                  {t(`message.notificationCenter.types.${value}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading && (
          <PageLoadingState label={t('nav.loading')} testId="system-notify-loading" />
        )}
        {!isLoading && isError && (
          <div className="px-4 py-10 text-center">
            <ErrorBlock
              title={t('message.notificationCenter.loadFailed')}
              description={t('message.notificationCenter.loadFailedHint')}
            />
            <Button size="small" className="mt-3" onClick={() => void refetch()}>
              {t('message.notificationCenter.retry')}
            </Button>
          </div>
        )}
        {!isLoading && !isError && data.length === 0 && (
          <div className="px-4 py-10">
            <ErrorBlock
              status="empty"
              title={t('message.notificationCenter.empty')}
              description={t('message.notificationCenter.emptyHint')}
            />
          </div>
        )}
        {!isLoading && !isError && data.length > 0 && (
          <section className="mt-2 border-y border-[#ebebeb]">
            {data.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isMutating={isMutating}
                onArchive={handleArchive}
                onMarkRead={handleMarkRead}
                onOpen={handleOpen}
              />
            ))}
          </section>
        )}
        {hasNextPage && (
          <div className="px-4 py-4">
            <Button
              block
              size="small"
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage
                ? t('message.notificationCenter.loadingMore')
                : t('message.notificationCenter.loadMore')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default SystemNotifyPage;
