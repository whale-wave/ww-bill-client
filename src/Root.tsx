import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { useUserStore } from '@/features/auth';
import { audioWeb } from '@/shared/lib';

export function Root() {
  const { setUserInfo } = useUserStore(({ setUserInfo }) => ({ setUserInfo }));
  const { token } = useUserStore(({ token }) => ({ token }));
  const { data: userAppConfig } = useGetUserAppConfigQuery({
    options: { enabled: Boolean(token) },
  });

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo)
      setUserInfo(JSON.parse(userInfo));

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
