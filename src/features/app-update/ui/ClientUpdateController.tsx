import type { FC } from 'react';
import type { ClientReleaseManifest } from '@/entities/app-release';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import {
  clientLatestReleaseQueryOptions,
  formatClientReleaseDescription,
  getInstalledAndroidVersion,
  isAndroidClientUpdateAvailable,
  isCurrentWebRelease,
  isWebClientUpdateAvailable,
} from '@/entities/app-release';
import { APP_INFO } from '@/shared/config/app-info';
import { fetchBuildInfo, refreshForBuild } from '@/shared/config/build-info';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { showAppActionSheet } from '@/shared/ui';

const REMINDER_KEY = 'client-release-reminder';
const SEEN_KEY = 'client-release-seen';
const REMINDER_INTERVAL = 24 * 60 * 60 * 1000;

function getReleaseKey(release: ClientReleaseManifest, platform: 'android' | 'web') {
  const targetVersion = platform === 'android' ? release.android.versionCode : release.web.buildId;
  return `${platform}:${release.publishedAt ?? release.versionName}:${targetVersion}`;
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
  const installedRef = useRef<Awaited<ReturnType<typeof getInstalledAndroidVersion>>>(null);

  const showWebRelease = useCallback(async (release: ClientReleaseManifest) => {
    const releaseKey = getReleaseKey(release, 'web');
    const description = formatClientReleaseDescription(release, t('aboutSupport.webUpdateDescription', { version: release.versionName }));
    if (isCurrentWebRelease(APP_INFO.buildId, release)) {
      if (readStoredValue(SEEN_KEY) === releaseKey)
        return;
      rememberSeen(releaseKey);
      showAppActionSheet({
        actions: [{ key: 'acknowledge', text: t('aboutSupport.gotIt') }],
        description,
        title: t('aboutSupport.updatedTitle', { version: release.versionName }),
      });
      return;
    }

    const deployedBuild = await fetchBuildInfo();
    if (isWebClientUpdateAvailable(APP_INFO.buildId, deployedBuild.buildId, release)) {
      if (wasRecentlyReminded(releaseKey))
        return;
      rememberReminder(releaseKey);
      showAppActionSheet({
        actions: [
          {
            key: 'update',
            text: t('aboutSupport.webUpdateNow'),
            onClick: () => refreshForBuild(window.location, release.web.buildId),
          },
          { key: 'later', text: t('aboutSupport.later') },
        ],
        cancelText: t('common:actions.cancel'),
        description,
        title: t('aboutSupport.updateAvailable'),
      });
    }
  }, [t]);

  const showAndroidRelease = useCallback(async (release: ClientReleaseManifest) => {
    const installed = installedRef.current ?? await getInstalledAndroidVersion();
    installedRef.current = installed;
    if (!installed || !isAndroidClientUpdateAvailable(installed, release))
      return;
    const releaseKey = getReleaseKey(release, 'android');
    if (wasRecentlyReminded(releaseKey))
      return;
    rememberReminder(releaseKey);
    showAppActionSheet({
      actions: [
        { key: 'update', text: t('aboutSupport.downloadUpdate'), onClick: () => void openExternalUrl(release.android.downloadUrl) },
        { key: 'later', text: t('aboutSupport.later') },
      ],
      cancelText: t('common:actions.cancel'),
      description: formatClientReleaseDescription(release, t('aboutSupport.updateAvailable')),
      title: t('aboutSupport.updateAvailable'),
    });
  }, [t]);

  const check = useCallback(async (force = false) => {
    const platform = Capacitor.getPlatform();
    if (!['android', 'web'].includes(platform) || (platform === 'web' && import.meta.env.DEV) || checkingRef.current)
      return;
    checkingRef.current = true;
    try {
      const response = await queryClient.fetchQuery(clientLatestReleaseQueryOptions(force));
      if (platform === 'android')
        await showAndroidRelease(response.data);
      else
        await showWebRelease(response.data);
    }
    catch {
      // Release checks are best-effort and must never interrupt bookkeeping.
    }
    finally {
      checkingRef.current = false;
    }
  }, [queryClient, showAndroidRelease, showWebRelease]);

  useEffect(() => {
    void check();
    const handleOnline = () => void check(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible')
        void check(true);
    };
    const handlePageShow = () => void check(true);

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    let removeAppListener: (() => void) | undefined;
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive)
        void check(true);
    }).then((listener) => { removeAppListener = () => listener.remove(); });
    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      removeAppListener?.();
    };
  }, [check]);

  return null;
};
