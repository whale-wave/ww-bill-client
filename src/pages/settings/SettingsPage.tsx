import type { FC, ReactNode } from 'react';
import type { SupportedLang } from '@/shared/i18n';
import { ActionSheet, List, Switch, Toast } from 'antd-mobile';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/entities/user-app-config';
import { ROUTES_PATH } from '@/shared/config/routes';
import { i18n, SUPPORTED_LANGS, useTranslation } from '@/shared/i18n';
import { clearLocalStorage, getLocalStorageSize } from '@/shared/lib';
import { audioWeb, playSound } from '@/shared/lib/play-sound';
import { useSeniorMode } from '@/shared/lib/senior-mode';
import { Gap, NavBar } from '@/shared/ui';
import styles from './index.module.scss';

export interface CustomListItem {
  title: string;
  path?: string;
  onClick?: () => void;
  description?: string;
  extra?: ReactNode;
}

const Settings: FC = () => {
  const { t } = useTranslation('settings');
  const { data: userAppConfig } = useGetUserAppConfigQuery();
  const canPlay = userAppConfig?.isOpenSoundEffect ?? false;
  const visibleAmountSwitch = userAppConfig?.isDisplayAmountSwitch ?? false;
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();

  const [patchUserAppConfigMutate] = usePatchUserAppConfigMutation();
  const [localStorageSize, setLocalStorageSize] = useState(() => getLocalStorageSize());

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
    await patchUserAppConfigMutate({
      isDisplayAmountSwitch: val,
    });
  };

  const handleSoundSwitch = async (val: boolean) => {
    if (val) {
      if (audioWeb.hasCache()) {
        audioWeb.loadCache();
      }
      else {
        void audioWeb.download();
      }
      audioWeb.open();
    }
    else {
      audioWeb.close();
    }

    await patchUserAppConfigMutate({
      isOpenSoundEffect: val,
    });

    setLocalStorageSize(getLocalStorageSize());
    playSound.click();
  };

  const [currentLang, setCurrentLang] = useState<SupportedLang>(() => i18n.language as SupportedLang);

  const handleSwitchLang = useCallback(() => {
    const langEntries = Object.entries(SUPPORTED_LANGS) as [SupportedLang, string][];
    const sheet = ActionSheet.show({
      actions: langEntries.map(([key, label]) => ({
        text: label,
        key,
        bold: key === currentLang,
        onClick: () => {
          i18n.changeLanguage(key);
          setCurrentLang(key);
          sheet.close();
          Toast.show(t('language.changed'));
        },
      })),
      cancelText: t('common:nav.cancel'),
    });
  }, [currentLang, t]);

  const clearCache = () => {
    clearLocalStorage();
    setLocalStorageSize(getLocalStorageSize());
    Toast.show(t('storage.cleared'));
  };

  const baseListGroup = [
    {
      title: t('account.title'),
      path: '/user-info',
      onClick() {
        goTo(this.path);
      },
    },
  ];
  const functionListGroup = [
    {
      title: t('category.title'),
      path: ROUTES_PATH.CATEGORY_SETTINGS.getPath(),
      onClick() {
        goTo(this.path!);
      },
    },
  ] as CustomListItem[];
  const personalizedSettingsListGroup = [
    {
      title: t('language.switch'),
      extra: (
        <span className="text-base text-[#969696]">
          {SUPPORTED_LANGS[currentLang]}
        </span>
      ),
      onClick: handleSwitchLang,
    },
    {
      title: t('sound.effect'),
      extra: <Switch checked={canPlay} onChange={handleSoundSwitch} />,
    },
    {
      title: t('seniorMode.switch'),
      description: t('seniorMode.desc'),
      extra: <Switch checked={isSeniorMode} onChange={toggleSeniorMode} />,
    },
  ];
  const dataSecurityListGroup = [
    {
      title: t('export'),
      path: '/export-data',
      onClick() { goTo(this.path!); },
    },
    {
      title: t('amount.visible'),
      extra: (
        <Switch
          checked={visibleAmountSwitch}
          onChange={onToggleVisibleAmountSwitch}
        />
      ),
      description: t('amount.visibleDesc'),
    },
  ] as CustomListItem[];
  const systemSettingListGroup = [
    {
      title: t('storage.clear'),
      onClick: clearCache,
      extra: (<span>{localStorageSize}</span>),
    },
    {
      title: t('invite'),
    },
  ];

  return (
    <div className="page">
      <NavBar back={t('common:nav.back')} onBack={handleBack}>
        {t('title')}
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
        <List header={t('function.title')}>
          {functionListGroup.map(item => (
            <List.Item
              key={item.title}
              onClick={item.onClick?.bind(item)}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
        <List header={t('personal')}>
          {personalizedSettingsListGroup.map(item => <List.Item key={item.title} extra={item.extra} onClick={item.onClick}>{item.title}</List.Item>)}
        </List>
        <List header={t('dataSecurity')}>
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
        <List header={t('system')}>
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
