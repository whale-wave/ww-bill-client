import type { FC, ReactNode } from 'react';
import { List, Switch, Toast } from 'antd-mobile';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gap, NavBar } from '@/components/ui/index.ts';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/hooks';
import { playSound } from '@/modules';
import { audioWeb } from '@/modules/playSound';
import { useSystemStore } from '@/store';
import styles from './index.module.scss';

export interface CustomListItem {
  title: string;
  path?: string;
  onClick?: () => void;
  description?: string;
  extra?: ReactNode;
}

const Settings: FC = () => {
  // TODO: 需要调整为获取指定的字段
  const {
    visibleAmountSwitch,
    openPlay,
    toggleVisibleAmountSwitch,
    setVisibleAmount,
    setVisibleAmountSwitch,
    hasAudioCache,
    closePlay,
    setStorageSize,
    localStorageSize,
    canPlay,
    setCanPlay,
    clearStorage,
  } = useSystemStore();
  const { data: userAppConfig } = useGetUserAppConfigQuery();
  useEffect(() => {
    if (!userAppConfig)
      return;

    setVisibleAmount(userAppConfig.isDisplayAmount);
    setVisibleAmountSwitch(userAppConfig.isDisplayAmountSwitch);
    setCanPlay(userAppConfig.isOpenSoundEffect);
  }, [userAppConfig]);
  const [patchUserAppConfigMutationMutate] = usePatchUserAppConfigMutation();

  const navigate = useNavigate();

  const handleBack = () => {
    playSound.turnPage();
    navigate(-1);
  };

  const goTo = (path: string) => {
    if (!path)
      return;
    playSound.turnPage();
    navigate(path);
  };

  const onToggleVisibleAmountSwitch = async (val: boolean) => {
    playSound.click();
    toggleVisibleAmountSwitch();
    await patchUserAppConfigMutationMutate({
      isDisplayAmountSwitch: val,
    });
  };

  const handleSoundSwitch = async (val: boolean) => {
    if (val) {
      if (hasAudioCache) {
        audioWeb.loadCache();
      }
      else {
        void audioWeb.download();
      }
      openPlay();
    }
    else {
      closePlay();
    }

    await patchUserAppConfigMutationMutate({
      isOpenSoundEffect: val,
    });

    setTimeout(() => {
      setStorageSize();
    }, 100);
    playSound.click();
  };

  const clearCache = () => {
    clearStorage();
    Toast.show('清除成功');
  };

  const baseListGroup = [
    {
      title: '账号设置',
      path: '/user-info',
      onClick() {
        goTo(this.path);
      },
    },
  ];
  const functionListGroup = [
    {
      title: '类别设置',
    },
  ] as CustomListItem[];
  const personalizedSettingsListGroup = [
    {
      title: '声音开关',
      extra: <Switch checked={canPlay} onChange={handleSoundSwitch} />,
    },
  ];
  const dataSecurityListGroup = [
    {
      title: '导出数据',
      path: '/export-data',
      onClick() { goTo(this.path!); },
    },
    {
      title: '隐藏总金额',
      extra: (
        <Switch
          checked={visibleAmountSwitch}
          onChange={onToggleVisibleAmountSwitch}
        />
      ),
      description: '开启后, 默认隐藏首页总收支金额',
    },
  ] as CustomListItem[];
  const systemSettingListGroup = [
    {
      title: '清楚缓存',
      onClick: clearCache,
      extra: (<span>{localStorageSize}</span>),
    },
    {
      title: '邀请好友',
    },
  ];

  return (
    <div className="page">
      <NavBar back="返回" onBack={handleBack}>
        设置
      </NavBar>
      <div className={styles.wrapper}>
        <List>
          <Gap />
          {baseListGroup.map(item => (
            <List.Item
              key={item.title}
              onClick={item.onClick.bind(item)}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
        <List header="功能设置">
          {functionListGroup.map(item => (
            <List.Item
              key={item.title}
              onClick={item.onClick?.bind(item)}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
        <List header="个性化设置">
          {personalizedSettingsListGroup.map(item => <List.Item key={item.title} extra={item.extra}>{item.title}</List.Item>)}
        </List>
        <List header="数据安全">
          {dataSecurityListGroup.map(item => (
            <List.Item
              key={item.title}
              extra={item.extra}
              description={item.description}
              onClick={item.onClick?.bind(item)}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
        <List header="系统设置">
          {systemSettingListGroup.map(item => (
            <List.Item
              key={item.title}
              onClick={item.onClick}
              extra={item.extra}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
      </div>
    </div>
  );
};

export default Settings;
