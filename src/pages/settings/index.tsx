import { playSound } from '@/modules';
import { audioWeb } from '@/modules/playSound';
import { Toast } from 'antd-mobile';
import { List, NavBar, Gap, Switch, Icon } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { useSystemStore } from '@/store';

const Settings = () => {
  // TODO: 需要调整为获取指定的字段
  const {
    visibleAmountSwitch,
    openPlay,
    toggleVisibleAmountSwitch,
    hasAudioCache,
    closePlay,
    setStorageSize,
    localStorageSize,
    canPlay,
    clearStorage,
  } = useSystemStore();
  const navigate = useNavigate();
  const handleBack = () => {
    playSound.turnPage();
    navigate(-1);
  };

  const onToggleVisibleAmountSwitch = () => {
    playSound.click();
    toggleVisibleAmountSwitch();
  };

  const handleSoundSwitch = (val: boolean) => {
    if (val) {
      if (hasAudioCache) {
        audioWeb.loadCache();
      } else {
        void audioWeb.download();
      }
      openPlay();
    } else {
      closePlay();
    }
    setTimeout(() => {
      setStorageSize();
    }, 100);
    playSound.click();
  };

  const clearCache = () => {
    clearStorage();
    Toast.show('清除成功');
  };

  const groupOne = [
    {
      title: '账号设置',
      path: '/user-info',
    },
  ];
  const groupTwo = [
    {
      title: '类别设置',
      path: '',
    },
    {
      title: '导出数据',
      path: '/export-data',
    },
  ];
  const groupThree = [
    {
      title: '隐藏总金额',
      path: '',
      arrow: (
        <Switch
          checked={visibleAmountSwitch}
          onChange={onToggleVisibleAmountSwitch}
        />
      ),
    },
    {
      title: '声音开关',
      path: '',
      arrow: <Switch checked={canPlay} onChange={handleSoundSwitch} />,
    },
  ];
  const groupFour = [
    {
      title: '清楚缓存',
      path: '',
      onClick: clearCache,
      arrow: (
        <div>
          <span>{localStorageSize}</span> <Icon name="right" />
        </div>
      ),
    },
    {
      title: '邀请好友',
      path: '',
    },
    {
      title: '意见反馈',
      path: '',
    },
    {
      title: '帮助',
      path: '',
    },
    {
      title: '关于蓝鲸记账',
      path: '',
    },
  ];

  const goTo = (path: string) => {
    if (!path) return;
    navigate(path);
  };

  return (
    <div className="page">
      <NavBar back="返回" onBack={handleBack}>
        设置
      </NavBar>
      <div className={styles.wrapper}>
        <List>
          <Gap />
          {groupOne.map((item) => (
            <List.Item
              key={item.title}
              clickable
              onClick={() => goTo(item.path)}
            >
              {item.title}
            </List.Item>
          ))}
          <Gap />
          {groupTwo.map((item) => (
            <List.Item
              key={item.title}
              clickable
              onClick={() => goTo(item.path)}
            >
              {item.title}
            </List.Item>
          ))}
          <Gap />
          {groupThree.map((item) => (
            <List.Item
              key={item.title}
              clickable={false}
              onClick={() => goTo(item.path)}
              arrow={item.arrow}
              style={{
                paddingTop: 5,
                paddingBottom: 5,
              }}
            >
              {item.title}
            </List.Item>
          ))}
          <Gap />
          {groupFour.map((item) => (
            <List.Item
              key={item.title}
              clickable
              onClick={item.onClick}
              arrow={item.arrow}
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
