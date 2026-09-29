import type { FC } from 'react';
import type { VersionUpdate } from '../model/release-prompt';
import type { UserNotification } from '@/entities/notification';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { getPlatformLatestReleaseApi, useClientLatestReleaseQuery } from '@/entities/app-release';
import { markNotificationReadApi, NotificationDetailModal, notificationKeys, useNotificationsQuery, UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { useAuthStore } from '@/features/auth';
import { getAppSocket } from '@/shared/api/socket';
import { APP_INFO } from '@/shared/config/app-info';
import { fetchBuildInfo, isNewerBuild, refreshForBuild } from '@/shared/config/build-info';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { showDate } from '@/shared/lib/time';
import { androidVersionUpdate, isAndroidUpdateAvailable, webVersionUpdate } from '../model/release-prompt';
import { VersionUpdateModal } from './VersionUpdateModal';

function getWebChannel() {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
    || window.matchMedia?.('(display-mode: standalone)').matches === true;
  return standalone ? 'home-screen' : 'browser';
}

export const ClientUpdateController: FC = () => {
  const { t: commonT } = useTranslation('common');
  const queryClient = useQueryClient();
  const platform = Capacitor.getPlatform() === 'android' ? 'android' : 'web';
  const webChannel = platform === 'web' ? getWebChannel() : 'browser';
  const token = useAuthStore(state => state.token);
  const notificationsQuery = useNotificationsQuery({
    params: { includeClientReleases: false, limit: 20, platform },
    queryOptions: { enabled: Boolean(token) },
  });
  const androidReleaseQuery = useClientLatestReleaseQuery({
    platform: 'android',
    queryOptions: { enabled: false },
  });
  const androidRefetchRef = useRef(androidReleaseQuery.refetch);
  androidRefetchRef.current = androidReleaseQuery.refetch;
  const shownGeneralRef = useRef<string | null>(null);
  const dialogReservedRef = useRef(false);
  const realtimeNoticeIdRef = useRef<string | null>(null);
  const dismissedWebBuildRef = useRef<string | null>(null);
  const webCheckInFlightRef = useRef(false);
  const androidCheckInFlightRef = useRef(false);
  const [versionCheckReady, setVersionCheckReady] = useState(false);
  const [versionUpdate, setVersionUpdate] = useState<VersionUpdate | null>(null);
  const [promptNotification, dispatchPromptNotification] = useReducer(
    (_current: UserNotification | null, next: UserNotification | null) => next,
    null,
  );

  const checkWebUpdate = useCallback(async () => {
    if (platform !== 'web' || webCheckInFlightRef.current)
      return;
    webCheckInFlightRef.current = true;
    setVersionCheckReady(false);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2_500);
    try {
      const build = await fetchBuildInfo(fetch, controller.signal);
      if (!isNewerBuild(APP_INFO.buildId, build) || dismissedWebBuildRef.current === `${webChannel}:${build.buildId}`)
        return;
      setVersionUpdate(current => current ?? webVersionUpdate(build));
      void getPlatformLatestReleaseApi('web').then((response) => {
        setVersionUpdate((current) => {
          if (current?.platform !== 'web' || current.buildId !== build.buildId
            || dismissedWebBuildRef.current === `${webChannel}:${build.buildId}`) {
            return current;
          }
          return webVersionUpdate(build, response.data);
        });
      }).catch(() => undefined);
    }
    catch {
      // A failed version check must not block bookkeeping or notifications.
    }
    finally {
      window.clearTimeout(timeout);
      webCheckInFlightRef.current = false;
      setVersionCheckReady(true);
    }
  }, [platform, webChannel]);

  const checkAndroidUpdate = useCallback(async () => {
    if (platform !== 'android' || androidCheckInFlightRef.current)
      return;
    androidCheckInFlightRef.current = true;
    setVersionCheckReady(false);
    try {
      const [info, result] = await Promise.all([App.getInfo(), androidRefetchRef.current()]);
      const installedVersionCode = Number.parseInt(info.build, 10);
      const release = result.data?.data;
      if (isAndroidUpdateAvailable(release, installedVersionCode))
        setVersionUpdate(current => current ?? androidVersionUpdate(release!));
    }
    catch {
      // The check is retried the next time the app becomes active.
    }
    finally {
      androidCheckInFlightRef.current = false;
      setVersionCheckReady(true);
    }
  }, [platform]);

  useEffect(() => {
    if (platform === 'android')
      void checkAndroidUpdate();
    else
      void checkWebUpdate();
  }, [checkAndroidUpdate, checkWebUpdate, platform]);

  const triggerNoticeDialog = useCallback((notice: UserNotification) => {
    const noticeKey = `${notice.id}:${notice.version}`;
    if (shownGeneralRef.current === noticeKey || dialogReservedRef.current)
      return;
    shownGeneralRef.current = noticeKey;
    dialogReservedRef.current = true;
    queueMicrotask(() => dispatchPromptNotification(notice));
  }, []);

  const closeNoticeDialog = useCallback(() => {
    const notice = promptNotification;
    dispatchPromptNotification(null);
    dialogReservedRef.current = false;
    if (notice) {
      void markNotificationReadApi(notice.id, notice.version)
        .then(() => queryClient.invalidateQueries(notificationKeys.all))
        .catch(() => undefined);
    }
  }, [promptNotification, queryClient]);

  const closeVersionUpdate = useCallback(() => {
    if (versionUpdate?.platform === 'web')
      dismissedWebBuildRef.current = `${webChannel}:${versionUpdate.buildId}`;
    setVersionUpdate(null);
  }, [versionUpdate, webChannel]);

  const confirmVersionUpdate = useCallback(() => {
    if (!versionUpdate)
      return;
    if (versionUpdate.platform === 'web' && versionUpdate.buildId) {
      refreshForBuild(window.location, versionUpdate.buildId);
      return;
    }
    if (versionUpdate.platform === 'android' && versionUpdate.downloadUrl)
      void openExternalUrl(versionUpdate.downloadUrl);
    setVersionUpdate(null);
  }, [versionUpdate]);

  useEffect(() => {
    if (!token || !versionCheckReady || versionUpdate || promptNotification)
      return;
    const unreadNotices = (notificationsQuery.data ?? []).filter(item =>
      item.type === UserNotificationType.SYSTEM_ANNOUNCEMENT
      && item.status === UserNotificationStatus.UNREAD,
    );
    const importantNotice = unreadNotices.find(item => item.payload?.promptLevel === 'important');
    if (importantNotice) {
      triggerNoticeDialog(importantNotice);
      return;
    }
    if (realtimeNoticeIdRef.current) {
      const targetId = realtimeNoticeIdRef.current;
      realtimeNoticeIdRef.current = null;
      const onlineNotice = unreadNotices.find(item => item.id === targetId);
      if (onlineNotice)
        triggerNoticeDialog(onlineNotice);
    }
  }, [notificationsQuery.data, promptNotification, token, triggerNoticeDialog, versionCheckReady, versionUpdate]);

  const refreshNotifications = useCallback(async () => {
    if (token)
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  }, [queryClient, token]);

  useEffect(() => {
    const socket = getAppSocket();
    const handlePublishedNotification = (data?: { id?: number; kind?: string }) => {
      if (data?.id && data.kind === 'general')
        realtimeNoticeIdRef.current = `system:${data.id}`;
      void refreshNotifications();
    };
    const handleChangedNotification = () => {
      void refreshNotifications();
    };
    const handleSocketConnect = () => void refreshNotifications();
    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      if (!isActive)
        return;
      if (platform === 'android')
        void checkAndroidUpdate();
      else
        void checkWebUpdate();
      void refreshNotifications();
    };
    const handleVisibilityChange = () => {
      if (platform === 'web' && document.visibilityState === 'visible')
        void checkWebUpdate();
    };
    socket?.on('connect', handleSocketConnect);
    socket?.on('notification:published', handlePublishedNotification);
    socket?.on('notification:updated', handleChangedNotification);
    socket?.on('notification:deleted', handleChangedNotification);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    let removeAppListener: (() => void) | undefined;
    void App.addListener('appStateChange', handleAppStateChange).then((listener) => {
      removeAppListener = () => listener.remove();
    });
    return () => {
      socket?.off('connect', handleSocketConnect);
      socket?.off('notification:published', handlePublishedNotification);
      socket?.off('notification:updated', handleChangedNotification);
      socket?.off('notification:deleted', handleChangedNotification);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      removeAppListener?.();
    };
  }, [checkAndroidUpdate, checkWebUpdate, platform, refreshNotifications]);

  return (
    <>
      <VersionUpdateModal update={versionUpdate} onClose={closeVersionUpdate} onConfirm={confirmVersionUpdate} />
      <NotificationDetailModal
        notification={versionUpdate ? null : promptNotification}
        onClose={closeNoticeDialog}
        timeLabel={promptNotification ? showDate(promptNotification.createdAt) : ''}
        typeLabel={promptNotification
          ? commonT(`message.notificationCenter.types.${promptNotification.type}`, { defaultValue: promptNotification.type })
          : ''}
      />
    </>
  );
};
