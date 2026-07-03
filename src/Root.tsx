import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { audioWeb } from '@/shared/lib';
import { useSystemStore, useUserStore } from '@/store';

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
