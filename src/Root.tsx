import { useEffect } from 'react';
import { audioWeb } from './modules/playSound';
import { Outlet } from 'react-router-dom';
import { useSystemStore, useUserStore } from '@/store';

export const Root = () => {
  const { setUserInfo } = useUserStore(({ setUserInfo }) => ({ setUserInfo }));
  const { syncAudioWebData } = useSystemStore(({ syncAudioWebData }) => ({
    syncAudioWebData,
  }));
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) setUserInfo(JSON.parse(userInfo));

    audioWeb.loadCache();
    syncAudioWebData();
  }, []);

  return <Outlet />;
};
