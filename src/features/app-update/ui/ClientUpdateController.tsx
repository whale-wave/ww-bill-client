import type { FC } from 'react';
import type { UserNotification } from '@/entities/notification';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useClientLatestReleaseQuery } from '@/entities/app-release';
import { markNotificationReadApi, NotificationDetailModal, notificationKeys, useNotificationsQuery, UserNotificationStatus, UserNotificationType } from '@/entities/notification';
import { useAuthStore } from '@/features/auth';
import { getAppSocket } from '@/shared/api/socket';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { showDate } from '@/shared/lib/time';
import { androidReleaseNotification, isAndroidUpdateAvailable, selectWebReleasePrompt } from '../model/release-prompt';

const ANDROID_REMINDER_INTERVAL = 24 * 60 * 60 * 1000;

function androidReminderKey(versionCode: number) {
  return `ww-bill:android-update-reminder:${versionCode}`;
}

function wasAndroidReminderRecentlyShown(versionCode: number) {
  try {
    const shownAt = Number(window.localStorage.getItem(androidReminderKey(versionCode)));
    return Number.isFinite(shownAt) && Date.now() - shownAt < ANDROID_REMINDER_INTERVAL;
  }
  catch {
    return false;
  }
}

function rememberAndroidReminder(versionCode: unknown) {
  if (typeof versionCode !== 'number' || !Number.isSafeInteger(versionCode) || versionCode < 1)
    return;
  try {
    window.localStorage.setItem(androidReminderKey(versionCode), String(Date.now()));
  }
  catch {
    // Update reminders remain useful when local storage is unavailable.
  }
}

export const ClientUpdateController: FC = () => {
  const { t: commonT } = useTranslation('common');
  const { t: settingsT } = useTranslation('settings');
  const queryClient = useQueryClient();
  const platform = Capacitor.getPlatform() === 'android' ? 'android' : 'web';
  const token = useAuthStore(state => state.token);
  const notificationsQuery = useNotificationsQuery({
    params: { includeClientReleases: false, limit: 20, platform },
    queryOptions: { enabled: Boolean(token) },
  });
  const webReleaseNotificationsQuery = useNotificationsQuery({
    params: { limit: 100, platform: 'web', type: UserNotificationType.CLIENT_RELEASE },
    queryOptions: { enabled: Boolean(token) && platform === 'web' },
  });
  const androidReleaseQuery = useClientLatestReleaseQuery({
    platform: 'android',
    queryOptions: { enabled: platform === 'android' },
  });
  const refetchAndroidRelease = androidReleaseQuery.refetch;
  const shownGeneralRef = useRef<string | null>(null);
  const dialogReservedRef = useRef(false);
  const realtimeNoticeIdRef = useRef<string | null>(null);
  const lastAndroidCheckRef = useRef(0);
  const [promptNotification, dispatchPromptNotification] = useReducer(
    (_current: UserNotification | null, next: UserNotification | null) => next,
    null,
  );
  const [androidVersionCode, setAndroidVersionCode] = useState<number | null>(null);
  const [androidCheckSequence, setAndroidCheckSequence] = useState(1);

  const triggerNoticeDialog = useCallback((notice: UserNotification) => {
    const noticeKey = `${notice.id}:${notice.version}`;
    if (shownGeneralRef.current === noticeKey || dialogReservedRef.current)
      return;
    shownGeneralRef.current = noticeKey;
    dialogReservedRef.current = true;
    queueMicrotask(() => {
      dispatchPromptNotification(notice);
    });
  }, []);

  const closeNoticeDialog = useCallback(() => {
    const notice = promptNotification;
    dispatchPromptNotification(null);
    dialogReservedRef.current = false;
    if (!notice)
      return;
    if (notice.id.startsWith('client-release:')) {
      rememberAndroidReminder(notice.payload?.versionCode);
      return;
    }
    void markNotificationReadApi(notice.id, notice.version)
      .then(() => queryClient.invalidateQueries(notificationKeys.all))
      .catch(() => undefined);
  }, [promptNotification, queryClient]);

  const confirmNoticeDialog = useCallback(() => {
    const notice = promptNotification;
    closeNoticeDialog();
    const downloadUrl = notice?.payload?.downloadUrl;
    if (notice?.id.startsWith('client-release:') && typeof downloadUrl === 'string' && downloadUrl)
      void openExternalUrl(downloadUrl);
  }, [closeNoticeDialog, promptNotification]);

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
    if (!token)
      return;
    const unreadNotices = (notificationsQuery.data ?? []).filter(item =>
      item.type === UserNotificationType.SYSTEM_ANNOUNCEMENT
      && item.status === UserNotificationStatus.UNREAD,
    );
    const importantNotice = unreadNotices.find(item => item.payload?.promptLevel === 'important');
    if (importantNotice && !promptNotification) {
      triggerNoticeDialog(importantNotice);
      return;
    }
    if (platform === 'web' && !promptNotification) {
      const releasePrompt = selectWebReleasePrompt(webReleaseNotificationsQuery.data);
      if (releasePrompt) {
        triggerNoticeDialog(releasePrompt);
        return;
      }
    }
    if (realtimeNoticeIdRef.current && !promptNotification) {
      const targetId = realtimeNoticeIdRef.current;
      realtimeNoticeIdRef.current = null;
      const pushNotice = unreadNotices.find(item => item.id === targetId && Boolean(item.payload?.promptEnabled));
      if (pushNotice)
        triggerNoticeDialog(pushNotice);
    }
  }, [notificationsQuery.data, platform, promptNotification, token, triggerNoticeDialog, webReleaseNotificationsQuery.data]);

  useEffect(() => {
    const release = androidReleaseQuery.data;
    if (platform !== 'android'
      || lastAndroidCheckRef.current === androidCheckSequence
      || !isAndroidUpdateAvailable(release, { versionCode: androidVersionCode })
      || !release
      || wasAndroidReminderRecentlyShown(release.android.versionCode)
      || promptNotification) {
      return;
    }
    lastAndroidCheckRef.current = androidCheckSequence;
    triggerNoticeDialog(androidReleaseNotification(release));
  }, [androidCheckSequence, androidReleaseQuery.data, androidVersionCode, platform, promptNotification, triggerNoticeDialog]);

  const refreshNotifications = useCallback(async () => {
    if (token)
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  }, [queryClient, token]);

  useEffect(() => {
    const socket = getAppSocket();
    const handleSocketNotification = (data?: { id?: number }) => {
      if (data?.id)
        realtimeNoticeIdRef.current = `system:${data.id}`;
      void refreshNotifications();
    };
    const handleSocketConnect = () => void refreshNotifications();
    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      if (!isActive)
        return;
      if (platform === 'android') {
        lastAndroidCheckRef.current = 0;
        setAndroidCheckSequence(sequence => sequence + 1);
        void refetchAndroidRelease();
      }
      void refreshNotifications();
    };
    socket?.on('connect', handleSocketConnect);
    socket?.on('notification:published', handleSocketNotification);
    socket?.on('notification:updated', handleSocketNotification);
    socket?.on('notification:deleted', handleSocketNotification);
    let removeAppListener: (() => void) | undefined;
    void App.addListener('appStateChange', handleAppStateChange).then((listener) => {
      removeAppListener = () => listener.remove();
    });
    return () => {
      socket?.off('connect', handleSocketConnect);
      socket?.off('notification:published', handleSocketNotification);
      socket?.off('notification:updated', handleSocketNotification);
      socket?.off('notification:deleted', handleSocketNotification);
      removeAppListener?.();
    };
  }, [platform, refetchAndroidRelease, refreshNotifications]);

  return (
    <NotificationDetailModal
      confirmText={promptNotification?.id.startsWith('client-release:') ? settingsT('aboutSupport.downloadUpdate') : undefined}
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
