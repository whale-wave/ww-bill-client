import type { FC } from 'react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { AppLockGuard } from '@/features/app-lock';
import { useAuthStore } from '@/features/auth';
import { audioWeb } from '@/shared/lib';
import { NavigationProgress } from './navigation-progress';

export const RootLayout: FC = () => {
  const { token, userId, bindSessionUserId } = useAuthStore(({ token, userId, bindSessionUserId }) => ({ token, userId, bindSessionUserId }));
  const userQuery = useGetUserUserInfoQuery({ options: { enabled: Boolean(token && !userId) } });
  const { data: userAppConfig, isError, isLoading } = useGetUserAppConfigQuery({
    options: { enabled: Boolean(token) },
  });

  useEffect(() => {
    if (userQuery.data && !userId)
      bindSessionUserId(userQuery.data.userId || String(userQuery.data.id));
  }, [bindSessionUserId, userId, userQuery.data]);

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
