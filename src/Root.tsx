import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUserStore } from '@/features/auth';
import { audioWeb } from '@/shared/lib';
import { useSystemStore } from '@/store';

export function Root() {
  const { setUserInfo } = useUserStore(({ setUserInfo }) => ({ setUserInfo }));
  const { syncAudioWebData } = useSystemStore(({ syncAudioWebData }) => ({
    syncAudioWebData,
  }));
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo)
      setUserInfo(JSON.parse(userInfo));

    audioWeb.loadCache();
    syncAudioWebData();
  }, []);

  return <Outlet />;
}
