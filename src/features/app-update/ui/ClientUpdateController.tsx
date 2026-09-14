import type { FC } from 'react';
import type { UserNotification } from '@/entities/notification';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { appReleaseKeys } from '@/entities/app-release';
import { markNotificationReadApi, NotificationDetailModal, notificationKeys, useNotificationsQuery, UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { useAuthStore } from '@/features/auth';
import { getAppSocket } from '@/shared/api/socket';
import { APP_INFO } from '@/shared/config/app-info';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { showDate } from '@/shared/lib/time';
import { selectClientReleasePrompt } from '../model/release-prompt';

export const ClientUpdateController: FC = () => {
  const { t: commonT } = useTranslation('common');
  const { t: settingsT } = useTranslation('settings');
  const queryClient = useQueryClient();
  const platform = Capacitor.getPlatform() === 'android' ? 'android' : 'web';
  const token = useAuthStore(state => state.token);
  const notificationsQuery = useNotificationsQuery({
    params: { limit: 20, platform },
    queryOptions: { enabled: Boolean(token) },
  });
  const releaseNotificationsQuery = useNotificationsQuery({
    // Fetch release history separately so ordinary announcements cannot push the
    // newest release outside the popup selection window.
    params: { limit: 100, platform, type: UserNotificationType.CLIENT_RELEASE },
    queryOptions: { enabled: Boolean(token) },
  });
  const shownGeneralRef = useRef<string | null>(null);
  const realtimeNoticeIdRef = useRef<string | null>(null);
  const [promptNotification, setPromptNotification] = useState<UserNotification | null>(null);
  const [androidVersionCode, setAndroidVersionCode] = useState<number | null>(null);

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
    if (platform !== 'android')
      return;
    let active = true;
    void App.getInfo()
      .then((info) => {
        const versionCode = Number.parseInt(info.build, 10);
        if (active && Number.isSafeInteger(versionCode) && versionCode > 0)
          setAndroidVersionCode(versionCode);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [platform]);

  useEffect(() => {
    if (!token || !notificationsQuery.data)
      return;

    const unreadNotices = notificationsQuery.data.filter(item =>
      item.type === UserNotificationType.SYSTEM_ANNOUNCEMENT
      && item.status === UserNotificationStatus.UNREAD,
    );

    // 1. Mandatory Important Notifications: Always prompt on launch/resume until acknowledged
    const importantNotice = unreadNotices.find(item => item.payload?.promptLevel === 'important');
    if (importantNotice) {
      triggerNoticeDialog(importantNotice);
      return;
    }

    const releasePrompt = selectClientReleasePrompt(
      releaseNotificationsQuery.data,
      platform,
      platform === 'android' ? { versionCode: androidVersionCode } : { versionName: APP_INFO.version },
    );
    if (releasePrompt) {
      triggerNoticeDialog(releasePrompt);
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
  }, [androidVersionCode, notificationsQuery.data, platform, releaseNotificationsQuery.data, token, triggerNoticeDialog]);

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
  }, [queryClient, token]);

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
        ? settingsT('aboutSupport.downloadUpdate')
        : undefined}
      notification={promptNotification}
      onClose={closeNoticeDialog}
      onConfirm={confirmNoticeDialog}
      timeLabel={promptNotification ? showDate(promptNotification.createdAt) : ''}
      typeLabel={promptNotification
        ? commonT(`message.notificationCenter.types.${promptNotification.type}`, { defaultValue: promptNotification.type })
        : ''}
    />
  );
};
