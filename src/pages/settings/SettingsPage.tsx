import type { FC } from 'react';
import type { SupportedLang } from '@/shared/i18n';
import { ActionSheet, Dialog, Toast } from 'antd-mobile';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/entities/user-app-config';
import {
  useWorkspaceBack,
  WorkspaceNavHeader,
} from '@/features/workspace-navigation';
import {
  SettingsOverviewPresentation,
} from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import {
  changeLanguage,
  i18n,
  SUPPORTED_LANGS,
  useTranslation,
} from '@/shared/i18n';
import { clearLocalStorage, getLocalStorageSize } from '@/shared/lib';
import { audioWeb, playSound } from '@/shared/lib/play-sound';
import { useSeniorMode } from '@/shared/lib/senior-mode';

const Settings: FC = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const onBack = useWorkspaceBack({ type: 'personal' });
  const { data: userAppConfig } = useGetUserAppConfigQuery();
  const canPlay = userAppConfig?.isOpenSoundEffect ?? false;
  const visibleAmountSwitch = userAppConfig?.isDisplayAmountSwitch ?? false;
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const [patchUserAppConfig] = usePatchUserAppConfigMutation();
  const [localStorageSize, setLocalStorageSize] = useState(() => getLocalStorageSize());
  const [currentLang, setCurrentLang] = useState<SupportedLang>(
    () => i18n.language as SupportedLang,
  );

  const goTo = (path: string) => {
    playSound.turnPage();
    navigate(path);
  };

  const handleSoundSwitch = async (checked: boolean) => {
    if (checked) {
      if (audioWeb.hasCache())
        audioWeb.loadCache();
      else
        void audioWeb.download();
      audioWeb.open();
    }
    else {
      audioWeb.close();
    }
    await patchUserAppConfig({ isOpenSoundEffect: checked });
    setLocalStorageSize(getLocalStorageSize());
    playSound.click();
  };

  const handleSwitchLang = useCallback(() => {
    const entries = Object.entries(SUPPORTED_LANGS) as [SupportedLang, string][];
    const sheet = ActionSheet.show({
      actions: entries.map(([key, label]) => ({
        bold: key === currentLang,
        key,
        onClick: () => {
          void changeLanguage(key);
          setCurrentLang(key);
          sheet.close();
          Toast.show(t('language.changed'));
        },
        text: label,
      })),
      cancelText: t('common:nav.cancel'),
    });
  }, [currentLang, t]);

  const handleClearCache = async () => {
    const confirmed = await Dialog.confirm({
      cancelText: t('common:nav.cancel'),
      confirmText: t('storage.clear'),
      content: t('storage.clear'),
      title: t('storage.clear'),
    });
    if (!confirmed)
      return;
    clearLocalStorage();
    setLocalStorageSize(getLocalStorageSize());
    Toast.show(t('storage.cleared'));
  };

  const showDeveloping = () => Toast.show('开发中');

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <WorkspaceNavHeader
        onBack={onBack}
        title={t('title')}
      />
      <main className="min-h-0 flex-grow overflow-auto">
        <SettingsOverviewPresentation
          sections={[
            {
              id: 'account',
              rows: [
                {
                  icon: 'account',
                  id: 'account',
                  kind: 'link',
                  label: t('account.title'),
                  onClick: () => goTo('/user-info'),
                },
                {
                  icon: 'category',
                  id: 'category',
                  kind: 'link',
                  label: t('category.title'),
                  onClick: () => goTo(ROUTES_PATH.CATEGORY_SETTINGS.getPath()),
                },
              ],
              title: t('function.title'),
            },
            {
              id: 'preferences',
              rows: [
                {
                  icon: 'language',
                  id: 'language',
                  kind: 'link',
                  label: t('language.switch'),
                  onClick: handleSwitchLang,
                  value: SUPPORTED_LANGS[currentLang],
                },
                {
                  checked: canPlay,
                  icon: 'record',
                  id: 'sound',
                  kind: 'switch',
                  label: t('sound.effect'),
                  onChange: checked => void handleSoundSwitch(checked),
                },
                {
                  checked: isSeniorMode,
                  description: t('seniorMode.desc'),
                  icon: 'appearance',
                  id: 'senior-mode',
                  kind: 'switch',
                  label: t('seniorMode.switch'),
                  onChange: toggleSeniorMode,
                },
                {
                  checked: visibleAmountSwitch,
                  description: t('amount.visibleDesc'),
                  icon: 'record',
                  id: 'amount',
                  kind: 'switch',
                  label: t('amount.visible'),
                  onChange: checked => void patchUserAppConfig({
                    isDisplayAmountSwitch: checked,
                  }),
                },
              ],
              title: t('personal'),
            },
            {
              id: 'data',
              rows: [
                {
                  icon: 'export',
                  id: 'export',
                  kind: 'link',
                  label: t('export'),
                  onClick: () => goTo('/export-data'),
                },
                {
                  danger: true,
                  icon: 'storage',
                  id: 'storage',
                  kind: 'action',
                  label: t('storage.clear'),
                  onClick: () => void handleClearCache(),
                  value: localStorageSize,
                },
              ],
              title: t('dataSecurity'),
            },
            {
              id: 'placeholders',
              rows: [
                {
                  icon: 'help',
                  id: 'help',
                  kind: 'placeholder',
                  label: '使用帮助',
                  onClick: showDeveloping,
                },
                {
                  icon: 'desktop',
                  id: 'desktop',
                  kind: 'placeholder',
                  label: '添加桌面入口',
                  onClick: showDeveloping,
                },
              ],
              title: t('system'),
            },
          ]}
        />
      </main>
    </div>
  );
};

export default Settings;
