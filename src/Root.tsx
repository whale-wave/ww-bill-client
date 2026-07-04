import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { useAuthStore } from '@/features/auth';
import { audioWeb } from '@/shared/lib';

export function Root() {
  const { token } = useAuthStore(({ token }) => ({ token }));
  const { data: userAppConfig } = useGetUserAppConfigQuery({
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

  return <Outlet />;
}
