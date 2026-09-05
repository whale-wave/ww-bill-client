import type { ChangeEvent } from 'react';
import type {
  UserNotification,
  UserNotificationStatus as UserNotificationStatusValue,
  UserNotificationType as UserNotificationTypeValue,
} from '@/entities/notification';
import {
  Button,
  Dialog,
  Toast,
} from 'antd-mobile';
import { Bell, ChevronDown } from 'lucide-react';
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
import { IllustratedEmptyState, PageHeader, PageLoadingState } from '@/shared/ui';
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
    <article className="border-b border-border-primary px-4 py-4 last:border-b-0">
      <div className="flex items-start gap-2">
        <span
          className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-[var(--ww-theme-color)]' : 'bg-transparent'}`}
          data-unread={isUnread ? 'true' : 'false'}
          aria-label={isUnread ? t('message.notificationCenter.unread') : undefined}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className={`min-w-0 text-[15px] leading-[22px] text-ww-ink ${isUnread ? 'font-semibold' : 'font-normal'}`}>
              {notification.title}
            </h2>
            <time
              className="shrink-0 text-xs leading-[20px] text-ww-soft"
              dateTime={notification.createdAt}
            >
              {showDate(notification.createdAt)}
            </time>
          </div>
          <div className="mt-2 inline-flex rounded-full bg-ww-surface-tint px-2 py-0.5 text-xs text-ww-mid">
            {t(`message.notificationCenter.types.${notification.type}`)}
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-ww-mid">
            {notification.content}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {target && (
              <Button
                size="mini"
                fill="none"
                className="min-h-11"
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
                className="min-h-11"
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
                className="min-h-11"
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
    <div className="page-new relative overflow-hidden" data-system-notify-page>
      <PageHeader
        backLabel={t('nav.back')}
        onBack={() => navigate(-1)}
        title={t('message.systemNotify.title')}
        right={(
          <button
            type="button"
            className="min-h-9 rounded-full border border-solid border-border-primary bg-ww-surface px-3 text-xs font-bold text-ww-ink shadow-ww-xs backdrop-blur-[var(--ww-card-blur)] disabled:text-ww-ghost"
            disabled={isMutating}
            data-testid="notification-read-all"
            onClick={handleMarkAllRead}
          >
            {t('message.notificationCenter.markAllRead')}
          </button>
        )}
      />

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-[var(--ww-page-gutter)] pb-[max(24px,env(safe-area-inset-bottom))] pt-1">
        <div className="sticky top-0 z-10 -mx-1 pb-3 pt-1">
          <div className="flex gap-2 rounded-[var(--ww-control-radius)] border border-solid border-border-primary bg-ww-surface-raised p-2 shadow-ww-xs backdrop-blur-[var(--ww-card-blur)]">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t('message.notificationCenter.statusFilter')}</span>
              <select
                className="h-10 w-full appearance-none rounded-[calc(var(--ww-control-radius)-4px)] border border-border-primary bg-ww-surface px-3 pr-8 text-sm font-medium text-ww-ink outline-none transition focus:border-primary-mid"
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
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ww-soft" size={15} strokeWidth={2.25} />
            </label>
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t('message.notificationCenter.typeFilter')}</span>
              <select
                className="h-10 w-full appearance-none rounded-[calc(var(--ww-control-radius)-4px)] border border-border-primary bg-ww-surface px-3 pr-8 text-sm font-medium text-ww-ink outline-none transition focus:border-primary-mid"
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
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ww-soft" size={15} strokeWidth={2.25} />
            </label>
          </div>
        </div>

        {isLoading && (
          <PageLoadingState label={t('nav.loading')} testId="system-notify-loading" />
        )}
        {!isLoading && isError && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <IllustratedEmptyState
              className="min-h-[360px]"
              description={t('message.notificationCenter.loadFailedHint')}
              icon={<Bell aria-hidden="true" size={38} strokeWidth={1.8} />}
              title={t('message.notificationCenter.loadFailed')}
            />
            <Button size="small" className="mb-7 px-5" onClick={() => void refetch()}>
              {t('message.notificationCenter.retry')}
            </Button>
          </div>
        )}
        {!isLoading && !isError && data.length === 0 && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <IllustratedEmptyState
              className="min-h-[400px]"
              description={t('message.notificationCenter.emptyHint')}
              icon={<Bell aria-hidden="true" size={38} strokeWidth={1.8} />}
              testId="system-notify-empty-state"
              title={t('message.notificationCenter.empty')}
            />
          </div>
        )}
        {!isLoading && !isError && data.length > 0 && (
          <section className="overflow-hidden rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
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
          <div className="py-4">
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
