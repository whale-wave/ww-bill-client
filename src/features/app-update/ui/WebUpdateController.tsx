import type { FC } from 'react';
import { Capacitor } from '@capacitor/core';
import { useCallback, useEffect, useRef } from 'react';
import { APP_INFO } from '@/shared/config/app-info';
import { fetchBuildInfo, isNewerBuild, refreshForBuild } from '@/shared/config/build-info';
import { useTranslation } from '@/shared/i18n';
import { showAppActionSheet } from '@/shared/ui';

export const WebUpdateController: FC = () => {
  const { t } = useTranslation('settings');
  const checkingRef = useRef(false);
  const notifiedBuildIdRef = useRef<string | null>(null);

  const check = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'web' || import.meta.env.DEV || checkingRef.current)
      return;
    checkingRef.current = true;
    try {
      const latest = await fetchBuildInfo();
      if (!isNewerBuild(APP_INFO.buildId, latest) || notifiedBuildIdRef.current === latest.buildId)
        return;
      notifiedBuildIdRef.current = latest.buildId;
      showAppActionSheet({
        actions: [
          {
            key: 'update',
            text: t('aboutSupport.webUpdateNow'),
            onClick: () => refreshForBuild(window.location, latest.buildId),
          },
          { key: 'later', text: t('aboutSupport.later') },
        ],
        cancelText: t('common:actions.cancel'),
        description: t('aboutSupport.webUpdateDescription', { version: latest.version }),
        title: t('aboutSupport.updateAvailable'),
      });
    }
    catch {
      // The page remains usable when a version check is offline or unavailable.
    }
    finally {
      checkingRef.current = false;
    }
  }, [t]);

  useEffect(() => {
    const onOnline = () => void check();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible')
        void check();
    };
    const onPageShow = () => void check();

    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [check]);

  return null;
};
