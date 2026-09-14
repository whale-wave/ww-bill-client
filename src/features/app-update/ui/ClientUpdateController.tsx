import type { FC } from 'react';
import type { ClientReleaseManifest } from '@/entities/app-release';
import type { UserNotification } from '@/entities/notification';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { appReleaseKeys, clientLatestReleaseQueryOptions, formatClientReleaseDescription } from '@/entities/app-release';
import { markNotificationReadApi, NotificationDetailModal, notificationKeys, useNotificationsQuery, UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { useAuthStore } from '@/features/auth';
import { getAppSocket } from '@/shared/api/socket';
import { APP_INFO } from '@/shared/config/app-info';
import { fetchBuildInfo, refreshForBuild } from '@/shared/config/build-info';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { showDate } from '@/shared/lib/time';
import { confirmAppAction, showAppInfoDialog } from '@/shared/ui';

const REMINDER_KEY = 'client-release-reminder';
const SEEN_KEY = 'client-release-seen';
const REMINDER_INTERVAL = 24 * 60 * 60 * 1000;

function getReleaseKey(release: ClientReleaseManifest, platform: 'android' | 'web') {
  return `${platform}:${release.noticeId ?? release.publishedAt ?? release.versionName}`;
}

function readStoredValue(key: string) {
  try {
    return localStorage.getItem(key);
  }
  catch {
    return null;
  }
}

function wasRecentlyReminded(releaseKey: string) {
  try {
    const value = JSON.parse(readStoredValue(REMINDER_KEY) ?? 'null') as { key?: string; remindedAt?: number } | null;
    return value?.key === releaseKey && typeof value.remindedAt === 'number' && Date.now() - value.remindedAt < REMINDER_INTERVAL;
  }
  catch {
    return false;
  }
}

function rememberReminder(releaseKey: string) {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify({ key: releaseKey, remindedAt: Date.now() }));
  }
  catch {
    // Storage is optional; a failed write should not block the update prompt.
  }
}

function rememberSeen(releaseKey: string) {
  try {
    localStorage.setItem(SEEN_KEY, releaseKey);
  }
  catch {
    // Storage is optional; a failed write should not block the release notice.
  }
}

export const ClientUpdateController: FC = () => {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const checkingRef = useRef(false);
  const platform = Capacitor.getPlatform() === 'android' ? 'android' : 'web';
  const token = useAuthStore(state => state.token);
  const notificationsQuery = useNotificationsQuery({
    params: { limit: 20, platform },
    queryOptions: { enabled: Boolean(token) },
  });
  const shownGeneralRef = useRef<string | null>(null);
  const realtimeNoticeIdRef = useRef<string | null>(null);
  const [promptNotification, setPromptNotification] = useState<UserNotification | null>(null);

  const triggerNoticeDialog = useCallback((notice: UserNotification) => {
    const noticeKey = `${notice.id}:${notice.version}`;
    if (shownGeneralRef.current === noticeKey)
      return;
    shownGeneralRef.current = noticeKey;

    setPromptNotification(notice);
  }, []);

  const closeNoticeDialog = useCallback(() => {
    const notice = promptNotification;
    setPromptNotification(null);
    if (!notice)
      return;

    void markNotificationReadApi(notice.id, notice.version)
      .then(() => {
        void queryClient.invalidateQueries(notificationKeys.all);
      })
      .catch(() => undefined);
  }, [promptNotification, queryClient]);

  const confirmNoticeDialog = useCallback(() => {
    const notice = promptNotification;
    closeNoticeDialog();
    if (!notice || notice.type !== UserNotificationType.CLIENT_RELEASE)
      return;

    const downloadUrl = notice.payload?.downloadUrl;
    if (platform === 'android' && typeof downloadUrl === 'string' && downloadUrl) {
      void openExternalUrl(downloadUrl);
    }
  }, [closeNoticeDialog, platform, promptNotification]);

  useEffect(() => {
    if (!token || !notificationsQuery.data)
      return;

    const unreadNotices = notificationsQuery.data.filter(item =>
      (item.type === UserNotificationType.SYSTEM_ANNOUNCEMENT || item.type === UserNotificationType.CLIENT_RELEASE)
      && item.status === UserNotificationStatus.UNREAD,
    );

    // 1. Mandatory Important Notifications: Always prompt on launch/resume until acknowledged
    const importantNotice = unreadNotices.find(item => item.payload?.promptLevel === 'important');
    if (importantNotice) {
      triggerNoticeDialog(importantNotice);
      return;
    }

    // 2. Real-time Online Push Notification: Prompt right when received while online
    if (realtimeNoticeIdRef.current) {
      const targetId = realtimeNoticeIdRef.current;
      realtimeNoticeIdRef.current = null;
      const pushNotice = unreadNotices.find(item =>
        item.id === targetId && Boolean(item.payload?.promptEnabled),
      );
      if (pushNotice) {
        triggerNoticeDialog(pushNotice);
      }
    }
  }, [notificationsQuery.data, token, triggerNoticeDialog]);

  const showWebRelease = useCallback(async (release: ClientReleaseManifest) => {
    const releaseKey = getReleaseKey(release, 'web');
    const description = formatClientReleaseDescription(release, t('aboutSupport.webUpdateDescription', { version: release.versionName }));
    if (!release.enabled || !release.web.enabled)
      return;
    const deployedBuild = await fetchBuildInfo().catch(() => ({
      buildId: APP_INFO.buildId,
      version: release.versionName,
    }));
    if (deployedBuild.version !== release.versionName && !import.meta.env.DEV)
      return;
    if (APP_INFO.buildId === deployedBuild.buildId || import.meta.env.DEV) {
      if (readStoredValue(SEEN_KEY) === releaseKey)
        return;
      rememberSeen(releaseKey);
      showAppInfoDialog({
        confirmText: t('aboutSupport.gotIt'),
        description,
        title: t('aboutSupport.updatedTitle', { version: release.versionName }),
      });
      return;
    }

    if (APP_INFO.buildId !== deployedBuild.buildId) {
      if (wasRecentlyReminded(releaseKey))
        return;
      rememberReminder(releaseKey);
      const confirmed = await confirmAppAction({
        cancelText: t('aboutSupport.later'),
        confirmText: t('aboutSupport.webUpdateNow'),
        description,
        title: t('aboutSupport.updateAvailable'),
      });
      if (confirmed) {
        refreshForBuild(window.location, deployedBuild.buildId);
      }
    }
  }, [t]);

  const check = useCallback(async (force = false) => {
    if (!token)
      return;
    const platform = Capacitor.getPlatform();
    if (!['android', 'web'].includes(platform) || checkingRef.current)
      return;
    checkingRef.current = true;
    try {
      const response = await queryClient.fetchQuery(clientLatestReleaseQueryOptions(force, platform as 'web' | 'android'));
      // A published release is normally paired with a client-release notification.
      // That notification is the single global prompt source so iOS home-screen
      // PWAs do not also receive the legacy update dialog in a different style.
      // Keep the old web-only flow as a fallback for legacy releases without one.
      if (platform === 'web' && !response.data.noticeId)
        await showWebRelease(response.data);
    }
    catch {
      // Release checks are best-effort and must never interrupt bookkeeping.
    }
    finally {
      checkingRef.current = false;
    }
  }, [queryClient, showWebRelease, token]);

  const lastRefreshTimeRef = useRef<number>(0);

  const refreshAll = useCallback(async (force = false) => {
    if (!token)
      return;
    const now = Date.now();
    if (!force && now - lastRefreshTimeRef.current < 3000)
      return;
    lastRefreshTimeRef.current = now;

    void queryClient.invalidateQueries(notificationKeys.all);
    void queryClient.invalidateQueries(appReleaseKeys.all);
    void check(force);
  }, [check, queryClient, token]);

  useEffect(() => {
    if (!token)
      return;

    void refreshAll();
    const handleOnline = () => void refreshAll();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible')
        void refreshAll();
    };
    const handlePageShow = () => void refreshAll();

    const socket = getAppSocket();
    const handleSocketNotification = (data?: { id?: number }) => {
      if (data?.id) {
        realtimeNoticeIdRef.current = `system:${data.id}`;
      }
      void refreshAll(true);
    };
    const handleSocketConnect = () => void refreshAll();

    socket?.on('connect', handleSocketConnect);
    socket?.on('notification:published', handleSocketNotification);
    socket?.on('notification:updated', handleSocketNotification);
    socket?.on('notification:deleted', handleSocketNotification);

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    let removeAppListener: (() => void) | undefined;
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive)
        void refreshAll();
    }).then((listener) => { removeAppListener = () => listener.remove(); });
    return () => {
      socket?.off('connect', handleSocketConnect);
      socket?.off('notification:published', handleSocketNotification);
      socket?.off('notification:updated', handleSocketNotification);
      socket?.off('notification:deleted', handleSocketNotification);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      removeAppListener?.();
    };
  }, [refreshAll, token]);

  return (
    <NotificationDetailModal
      confirmText={promptNotification?.type === UserNotificationType.CLIENT_RELEASE && platform === 'android'
        ? t('aboutSupport.downloadUpdate')
        : undefined}
      notification={promptNotification}
      onClose={closeNoticeDialog}
      onConfirm={confirmNoticeDialog}
      timeLabel={promptNotification ? showDate(promptNotification.createdAt) : ''}
      typeLabel={promptNotification
        ? t(`message.notificationCenter.types.${promptNotification.type}`, { defaultValue: promptNotification.type })
        : ''}
    />
  );
};
