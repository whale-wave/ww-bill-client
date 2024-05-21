import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { setUserInfo, syncAudioWebData } from './store/slice';
import { audioWeb } from './modules/playSound';
import { Outlet } from 'react-router-dom';

export const Root = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) dispatch(setUserInfo(JSON.parse(userInfo)));

    audioWeb.loadCache();
    dispatch(syncAudioWebData());
  }, []);

  return <Outlet />;
};
