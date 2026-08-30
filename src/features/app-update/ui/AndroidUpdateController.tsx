import type { FC } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { androidLatestReleaseQueryOptions, getInstalledAndroidVersion, isAndroidUpdateAvailable } from '@/entities/app-release';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { showAppActionSheet } from '@/shared/ui';

const DEDUPE_KEY = 'android-update-dismissed-version';

function wasDismissed(versionCode: number) {
  try {
    const value = JSON.parse(localStorage.getItem(DEDUPE_KEY) ?? 'null') as { versionCode?: number; remindedAt?: number } | null;
    return value?.versionCode === versionCode;
  }
  catch {
    return false;
  }
}

function rememberDismissed(versionCode: number) {
  try {
    localStorage.setItem(DEDUPE_KEY, JSON.stringify({ versionCode }));
  }
  catch {
    // Storage is optional; a failed write should not block the update prompt.
  }
}

export const AndroidUpdateController: FC = () => {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const checkingRef = useRef(false);
  const installedRef = useRef<Awaited<ReturnType<typeof getInstalledAndroidVersion>>>(null);

  const check = useCallback(async (force = false) => {
    if (Capacitor.getPlatform() !== 'android' || checkingRef.current)
      return;
    checkingRef.current = true;
    try {
      const installed = installedRef.current ?? await getInstalledAndroidVersion();
      installedRef.current = installed;
      if (!installed)
        return;
      const response = await queryClient.fetchQuery(androidLatestReleaseQueryOptions(force));
      const latest = response.data;
      if (!isAndroidUpdateAvailable(installed, latest) || wasDismissed(latest.versionCode))
        return;
      const markSeen = () => rememberDismissed(latest.versionCode);
      markSeen();
      showAppActionSheet({
        actions: [
          {
            key: 'update',
            text: t('aboutSupport.downloadUpdate'),
            onClick: () => {
              markSeen();
              void openExternalUrl(latest.downloadUrl);
            },
          },
          {
            key: 'details',
            text: t('aboutSupport.viewReleaseHistory'),
            onClick: () => {
              markSeen();
              navigate('/settings/about/releases');
            },
          },
          { key: 'later', text: t('aboutSupport.later') },
        ],
        cancelText: t('common:actions.cancel'),
        description: latest.releaseNotes || t('aboutSupport.updateAvailable'),
        title: t('aboutSupport.updateAvailable'),
      });
    }
    catch {
      // Update checks are best-effort and must never interrupt bookkeeping.
    }
    finally {
      checkingRef.current = false;
    }
  }, [navigate, queryClient, t]);

  useEffect(() => {
    void check();
    const online = () => void check();
    window.addEventListener('online', online);
    let removeAppListener: (() => void) | undefined;
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive)
        void check();
    }).then((listener) => { removeAppListener = () => listener.remove(); });
    return () => {
      window.removeEventListener('online', online);
      removeAppListener?.();
    };
  }, [check]);

  return null;
};
