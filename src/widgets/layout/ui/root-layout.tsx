import type { FC } from 'react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { AppLockGuard } from '@/features/app-lock';
import { useAuthStore } from '@/features/auth';
import { audioWeb } from '@/shared/lib';
import { NavigationProgress } from './navigation-progress';

export const RootLayout: FC = () => {
  const { token } = useAuthStore(({ token }) => ({ token }));
  const { data: userAppConfig, isError, isLoading } = useGetUserAppConfigQuery({
    options: { enabled: Boolean(token) },
  });

  useEffect(() => {
    audioWeb.loadCache();
  }, []);

  useEffect(() => {
    if (userAppConfig?.isOpenSoundEffect)
      audioWeb.open();
    else
      audioWeb.close();
  }, [userAppConfig?.isOpenSoundEffect]);

  return (
    <>
      <NavigationProgress />
      <AppLockGuard config={userAppConfig} isError={Boolean(token) && isError} isLoading={Boolean(token) && isLoading && !isError} token={token}>
        <Outlet />
      </AppLockGuard>
    </>
  );
};
